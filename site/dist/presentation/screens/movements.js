import { formatBRL } from '../../domain/money/money.js';
import { deleteTransaction, undoTransactionMutation } from '../../application/transactions/mutate-transaction.js';
import { isEditableManualTransaction } from '../../application/transactions/update-manual-transaction.js';
import { el } from '../dom.js';
import { icon } from '../icons.js';
import { showConfirmation, showSheet } from '../components/sheets.js';
import { showActionToast, showToast } from '../components/feedback.js';
import { openEditTransactionSheet } from './edit-transaction.js';
const DEFAULT_FILTERS = { search: '', period: 'all', nature: 'all', accountId: '', category: '', startDate: '', endDate: '' };
function signFor(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield' || transaction.kind === 'asset-yield')
        return '+';
    if (transaction.kind === 'expense')
        return '−';
    if (transaction.kind === 'asset-valuation' && transaction.amount > 0)
        return '+';
    return '';
}
function amountClass(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield' || transaction.kind === 'asset-yield')
        return 'positive-text';
    if (transaction.kind === 'expense')
        return 'negative-text';
    if (transaction.kind === 'asset-valuation')
        return transaction.amount >= 0 ? 'positive-text' : 'negative-text';
    return 'neutral-text';
}
function labelFor(transaction) {
    switch (transaction.kind) {
        case 'income': return transaction.description ?? 'Receita';
        case 'yield': return transaction.description ?? 'Rendimento';
        case 'expense': return transaction.description ?? 'Despesa';
        case 'transfer': return transaction.description ?? 'Transferência';
        case 'credit-card-payment': return transaction.description ?? 'Pagamento de fatura';
        case 'debt-payment': return transaction.description ?? 'Pagamento de dívida';
        case 'asset-contribution': return transaction.description ?? 'Aporte';
        case 'asset-withdrawal': return transaction.description ?? 'Resgate';
        case 'asset-yield': return transaction.description ?? 'Rendimento de ativo';
        case 'asset-valuation': return transaction.description ?? 'Valorização patrimonial';
        default: {
            const exhaustive = transaction;
            return exhaustive;
        }
    }
}
function metaFor(transaction) {
    if ('categoryId' in transaction && transaction.categoryId)
        return transaction.categoryId;
    switch (transaction.kind) {
        case 'income': return 'Receita';
        case 'yield': return 'Rendimento';
        case 'expense': return 'Despesa';
        case 'transfer': return 'Transferência';
        case 'credit-card-payment': return 'Pagamento de fatura';
        case 'debt-payment': return 'Pagamento de dívida';
        case 'asset-contribution': return 'Valor aplicado';
        case 'asset-withdrawal': return 'Valor resgatado';
        case 'asset-yield': return 'Rendimento';
        case 'asset-valuation': return 'Atualização de valor';
        default: {
            const exhaustive = transaction;
            return exhaustive;
        }
    }
}
function iconNameFor(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield')
        return 'income';
    if (transaction.kind === 'expense')
        return 'expense';
    if (transaction.kind === 'transfer')
        return 'transfer';
    if (transaction.kind === 'credit-card-payment' || transaction.kind === 'debt-payment')
        return 'payment';
    return 'investment';
}
function natureFor(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield')
        return 'income';
    if (transaction.kind === 'expense')
        return 'expense';
    if (transaction.kind === 'transfer')
        return 'transfer';
    if (transaction.kind === 'credit-card-payment' || transaction.kind === 'debt-payment')
        return 'payment';
    return 'patrimonial';
}
function accountIdsFor(transaction) {
    switch (transaction.kind) {
        case 'income':
        case 'yield':
        case 'debt-payment':
        case 'asset-contribution':
        case 'asset-withdrawal': return [transaction.accountId];
        case 'expense': return transaction.settlement.kind === 'account' ? [transaction.settlement.accountId] : [];
        case 'transfer': return [transaction.fromAccountId, transaction.toAccountId];
        case 'credit-card-payment': return transaction.source.kind === 'account' ? [transaction.source.accountId] : [];
        case 'asset-yield':
        case 'asset-valuation': return [];
        default: {
            const exhaustive = transaction;
            return exhaustive;
        }
    }
}
function localIsoDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function dateAllowed(date, filters) {
    if (filters.period === 'all')
        return true;
    const today = new Date();
    const todayIso = localIsoDate(today);
    if (filters.period === 'today')
        return date === todayIso;
    if (filters.period === 'month')
        return date.startsWith(todayIso.slice(0, 7));
    if (filters.period === '7d') {
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 6);
        return date >= localIsoDate(start) && date <= todayIso;
    }
    if (filters.startDate && date < filters.startDate)
        return false;
    if (filters.endDate && date > filters.endDate)
        return false;
    return true;
}
function matchesSearch(transaction, filters, accountMap) {
    const query = filters.search.trim().toLocaleLowerCase('pt-BR');
    if (!query)
        return true;
    const accountNames = accountIdsFor(transaction).map((id) => accountMap.get(id)?.name ?? '').join(' ');
    const text = [labelFor(transaction), metaFor(transaction), accountNames].join(' ').toLocaleLowerCase('pt-BR');
    return text.includes(query);
}
function isVisible(transaction, filters, accountMap) {
    if (!matchesSearch(transaction, filters, accountMap))
        return false;
    if (!dateAllowed(transaction.date, filters))
        return false;
    if (filters.nature !== 'all' && natureFor(transaction) !== filters.nature)
        return false;
    if (filters.accountId && !accountIdsFor(transaction).includes(filters.accountId))
        return false;
    if (filters.category && (!('categoryId' in transaction) || transaction.categoryId !== filters.category))
        return false;
    return true;
}
function activeFilterCount(filters) {
    let count = 0;
    if (filters.period !== 'all')
        count += 1;
    if (filters.nature !== 'all')
        count += 1;
    if (filters.accountId)
        count += 1;
    if (filters.category)
        count += 1;
    return count;
}
function choiceChip(label, active, onClick) {
    const chip = el('button', `movement-filter-chip${active ? ' active' : ''}`, [label]);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(active));
    chip.addEventListener('click', onClick);
    return chip;
}
function openFiltersSheet(current, accounts, categories, onApply) {
    let draft = { ...current };
    const body = el('div', 'movement-filter-sheet');
    let close = () => undefined;
    const render = () => {
        body.replaceChildren();
        const period = el('div', 'movement-filter-section', [el('strong', 'movement-filter-title', ['Período'])]);
        const periodChips = el('div', 'movement-filter-chips');
        const periods = [['all', 'Todos'], ['today', 'Hoje'], ['7d', '7 dias'], ['month', 'Este mês'], ['custom', 'Personalizado']];
        for (const [value, label] of periods)
            periodChips.append(choiceChip(label, draft.period === value, () => { draft = { ...draft, period: value }; render(); }));
        period.append(periodChips);
        if (draft.period === 'custom') {
            const dates = el('div', 'movement-custom-dates');
            const start = el('input', 'field-input');
            start.type = 'date';
            start.value = draft.startDate;
            start.setAttribute('aria-label', 'Data inicial');
            start.addEventListener('change', () => { draft = { ...draft, startDate: start.value }; });
            const end = el('input', 'field-input');
            end.type = 'date';
            end.value = draft.endDate;
            end.setAttribute('aria-label', 'Data final');
            end.addEventListener('change', () => { draft = { ...draft, endDate: end.value }; });
            dates.append(el('label', 'movement-date-field', [el('span', '', ['De']), start]), el('label', 'movement-date-field', [el('span', '', ['Até']), end]));
            period.append(dates);
        }
        const nature = el('div', 'movement-filter-section', [el('strong', 'movement-filter-title', ['Tipo'])]);
        const natureChips = el('div', 'movement-filter-chips');
        const natures = [['all', 'Todos'], ['income', 'Receitas'], ['expense', 'Despesas'], ['transfer', 'Transferências'], ['payment', 'Pagamentos'], ['patrimonial', 'Patrimoniais']];
        for (const [value, label] of natures)
            natureChips.append(choiceChip(label, draft.nature === value, () => { draft = { ...draft, nature: value }; render(); }));
        nature.append(natureChips);
        const accountSection = el('div', 'movement-filter-section', [el('strong', 'movement-filter-title', ['Conta'])]);
        const accountChips = el('div', 'movement-filter-chips');
        accountChips.append(choiceChip('Todas', !draft.accountId, () => { draft = { ...draft, accountId: '' }; render(); }));
        for (const account of accounts)
            accountChips.append(choiceChip(account.name, draft.accountId === account.id, () => { draft = { ...draft, accountId: account.id }; render(); }));
        accountSection.append(accountChips);
        const categorySection = el('div', 'movement-filter-section', [el('strong', 'movement-filter-title', ['Categoria'])]);
        const categoryChips = el('div', 'movement-filter-chips');
        categoryChips.append(choiceChip('Todas', !draft.category, () => { draft = { ...draft, category: '' }; render(); }));
        for (const category of categories)
            categoryChips.append(choiceChip(category, draft.category === category, () => { draft = { ...draft, category }; render(); }));
        categorySection.append(categoryChips);
        const actions = el('div', 'movement-filter-actions');
        const clear = el('button', 'btn secondary', ['Limpar']);
        clear.type = 'button';
        clear.addEventListener('click', () => { draft = { ...DEFAULT_FILTERS, search: current.search }; render(); });
        const apply = el('button', 'btn primary', ['Aplicar filtros']);
        apply.type = 'button';
        apply.addEventListener('click', () => { onApply(draft); close(); });
        actions.append(clear, apply);
        body.append(period, nature, accountSection, categorySection, actions);
    };
    render();
    close = showSheet('Filtrar movimentações', body);
}
export async function renderMovements(repositories, profile, mutations, onChanged) {
    const [transactions, accounts] = await Promise.all([
        repositories.transactions.listByProfile(profile.id),
        repositories.accounts.listByProfile(profile.id)
    ]);
    const accountMap = new Map(accounts.map((account) => [account.id, account]));
    const categories = Array.from(new Set(transactions.flatMap((transaction) => ('categoryId' in transaction && transaction.categoryId ? [transaction.categoryId] : [])))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    let filters = { ...DEFAULT_FILTERS };
    const root = el('div', 'screen movements-screen', [
        el('div', 'screen-heading', [el('div', '', [el('h1', '', ['Movimentações']), el('p', '', ['Tudo o que entrou, saiu ou mudou no seu dinheiro.'])])])
    ]);
    const searchInput = el('input', 'movement-search-input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Buscar movimentação';
    searchInput.setAttribute('aria-label', 'Buscar movimentação');
    const searchBox = el('label', 'movement-search-box', [icon('search', 'movement-search-icon'), searchInput]);
    const filterButton = el('button', 'movement-filter-button', [icon('filter', 'movement-filter-icon'), el('span', '', ['Filtrar']), el('b', 'movement-filter-count')]);
    filterButton.type = 'button';
    const tools = el('div', 'movement-tools', [searchBox, filterButton]);
    const summary = el('div', 'movement-filter-summary');
    const listHost = el('div', 'movement-list-host');
    root.append(tools, summary, listHost);
    const renderList = () => {
        const visible = transactions.filter((transaction) => isVisible(transaction, filters, accountMap));
        const count = activeFilterCount(filters);
        const badge = filterButton.querySelector('.movement-filter-count');
        if (badge) {
            badge.textContent = count > 0 ? String(count) : '';
            badge.hidden = count === 0;
        }
        summary.replaceChildren();
        if (count > 0)
            summary.append(el('span', '', [`${count} ${count === 1 ? 'filtro ativo' : 'filtros ativos'}`]), el('button', 'text-action', ['Limpar']));
        const clearButton = summary.querySelector('button');
        if (clearButton)
            clearButton.addEventListener('click', () => { filters = { ...DEFAULT_FILTERS, search: filters.search }; renderList(); });
        listHost.replaceChildren();
        if (visible.length === 0) {
            listHost.append(el('div', 'empty-card large', [el('strong', '', [transactions.length === 0 ? 'Seu extrato começa aqui' : 'Nenhuma movimentação encontrada']), el('span', '', [transactions.length === 0 ? 'Use o botão + para registrar uma receita, despesa ou transferência.' : 'Ajuste a busca ou os filtros para ver outros registros.'])]));
            return;
        }
        const list = el('section', 'statement-list');
        let lastDate = '';
        for (const transaction of visible) {
            if (transaction.date !== lastDate) {
                lastDate = transaction.date;
                const [year, month, day] = transaction.date.split('-');
                list.append(el('h3', 'date-heading', [`${day}/${month}/${year}`]));
            }
            const amount = `${signFor(transaction)}${formatBRL(transaction.amount)}`;
            const row = el('button', 'movement-row movement-button', [
                el('span', `movement-icon ${amountClass(transaction)}`, [icon(iconNameFor(transaction), 'movement-kind-icon')]),
                el('div', 'movement-copy', [el('strong', '', [labelFor(transaction)]), el('small', '', [metaFor(transaction)])]),
                el('b', `movement-amount ${amountClass(transaction)}`, [amount])
            ]);
            row.type = 'button';
            row.setAttribute('aria-label', `${labelFor(transaction)}, ${amount}. Abrir ações.`);
            row.addEventListener('click', () => openMovementActions(repositories, profile, mutations, transaction, onChanged));
            list.append(row);
        }
        listHost.append(list);
    };
    searchInput.addEventListener('input', () => { filters = { ...filters, search: searchInput.value }; renderList(); });
    filterButton.addEventListener('click', () => openFiltersSheet(filters, accounts, categories, (next) => { filters = next; renderList(); }));
    renderList();
    return root;
}
function openMovementActions(repositories, profile, mutations, transaction, onChanged) {
    const actions = el('div', 'action-menu');
    let close = () => undefined;
    if (isEditableManualTransaction(transaction)) {
        const edit = el('button', 'action-menu-row', [
            el('span', 'action-menu-symbol', ['✎']),
            el('span', 'action-menu-copy', [el('strong', '', ['Editar']), el('small', '', ['Corrija as informações desta movimentação.'])])
        ]);
        edit.type = 'button';
        edit.addEventListener('click', () => { close(); void openEditTransactionSheet(repositories, profile, mutations, transaction, onChanged); });
        actions.append(edit);
    }
    else {
        actions.append(el('div', 'inline-warning', [transaction.kind === 'debt-payment' || transaction.kind === 'credit-card-payment' ? 'Este pagamento está ligado à dívida ou fatura. Para corrigir, desfaça o pagamento e registre novamente.' : 'Este registro está ligado a outro item do Orion e não pode ser editado diretamente.']));
    }
    const isPayment = transaction.kind === 'debt-payment' || transaction.kind === 'credit-card-payment';
    const removeLabel = isPayment ? 'Desfazer pagamento' : 'Excluir';
    const remove = el('button', 'action-menu-row danger-row', [
        el('span', 'action-menu-symbol', ['×']),
        el('span', 'action-menu-copy', [
            el('strong', '', [removeLabel]),
            el('small', '', [isPayment ? 'O pagamento será revertido e poderá ser restaurado logo em seguida.' : 'A movimentação pode ser restaurada logo em seguida.'])
        ])
    ]);
    remove.type = 'button';
    remove.addEventListener('click', () => {
        close();
        showConfirmation(isPayment ? 'Desfazer este pagamento?' : 'Excluir movimentação?', isPayment ? 'O saldo e a dívida ou fatura voltarão ao estado anterior.' : 'A movimentação será removida e você poderá desfazer logo em seguida.', removeLabel, () => {
            void deleteTransaction(mutations, profile.id, transaction.id).then((event) => {
                onChanged();
                showActionToast(isPayment ? 'Pagamento desfeito.' : 'Movimentação excluída.', 'Desfazer', () => {
                    void undoTransactionMutation(mutations, profile.id, event.id).then(() => {
                        onChanged();
                        showToast(isPayment ? 'Pagamento restaurado.' : 'Movimentação restaurada.', 'success');
                    }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível desfazer.', 'error'));
                });
            }).catch((error) => showToast(error instanceof Error ? error.message : (isPayment ? 'Não foi possível desfazer o pagamento.' : 'Falha ao excluir.'), 'error'));
        });
    });
    actions.append(remove);
    close = showSheet(labelFor(transaction), actions);
}
