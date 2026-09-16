import { formatBRL } from '../../domain/money/money.js';
import { deleteTransaction, undoTransactionMutation } from '../../application/transactions/mutate-transaction.js';
import { isEditableManualTransaction } from '../../application/transactions/update-manual-transaction.js';
import { el } from '../dom.js';
import { showConfirmation, showSheet } from '../components/sheets.js';
import { showActionToast, showToast } from '../components/feedback.js';
import { openEditTransactionSheet } from '../screens/edit-transaction.js';
import { movementIcon } from './movement-icon.js';
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
function accountName(accountId, accounts) {
    if (!accountId)
        return null;
    return accounts.get(accountId)?.name ?? null;
}
function metaFor(transaction, accounts) {
    const category = 'categoryId' in transaction && transaction.categoryId ? transaction.categoryId : null;
    let account = null;
    if (transaction.kind === 'income' || transaction.kind === 'yield')
        account = accountName(transaction.accountId, accounts);
    else if (transaction.kind === 'expense' && transaction.settlement.kind === 'account')
        account = accountName(transaction.settlement.accountId, accounts);
    else if (transaction.kind === 'debt-payment')
        account = accountName(transaction.accountId, accounts);
    else if (transaction.kind === 'transfer') {
        const from = accountName(transaction.fromAccountId, accounts);
        const to = accountName(transaction.toAccountId, accounts);
        account = from && to ? `${from} → ${to}` : null;
    }
    const kind = transaction.kind === 'transfer' ? 'Transferência' : transaction.kind === 'credit-card-payment' ? 'Fatura' : transaction.kind === 'debt-payment' ? 'Dívida' : null;
    return [category ?? kind, account].filter(Boolean).join(' · ') || 'Movimentação';
}
function filterGroup(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield' || transaction.kind === 'asset-yield')
        return 'income';
    if (transaction.kind === 'expense' || transaction.kind === 'credit-card-payment' || transaction.kind === 'debt-payment')
        return 'expense';
    if (transaction.kind === 'transfer')
        return 'transfer';
    return 'other';
}
export async function renderMovementsV2(repositories, profile, mutations, onChanged) {
    const [transactions, accountList] = await Promise.all([
        repositories.transactions.listByProfile(profile.id),
        repositories.accounts.listByProfile(profile.id)
    ]);
    const accounts = new Map(accountList.map((account) => [account.id, account]));
    const root = el('div', 'screen movements-screen movements-screen-v2');
    if (transactions.length === 0) {
        root.append(el('div', 'empty-card large', [
            el('strong', '', ['Seu histórico começa aqui']),
            el('span', '', ['Use o botão + para registrar receita, despesa ou transferência.'])
        ]));
        return root;
    }
    const filters = el('div', 'movement-filters-v2');
    const list = el('section', 'statement-list statement-list-v2');
    let active = 'all';
    const options = [
        { id: 'all', label: 'Todos' },
        { id: 'income', label: 'Entradas' },
        { id: 'expense', label: 'Saídas' },
        { id: 'transfer', label: 'Transferências' }
    ];
    const buttons = new Map();
    const renderList = () => {
        list.replaceChildren();
        const filtered = active === 'all' ? transactions : transactions.filter((item) => filterGroup(item) === active);
        if (filtered.length === 0) {
            list.append(el('div', 'empty-card', [el('strong', '', ['Nada por aqui']), el('span', '', ['Não há movimentações nesse filtro.'])]));
            return;
        }
        let lastDate = '';
        for (const transaction of filtered) {
            if (transaction.date !== lastDate) {
                lastDate = transaction.date;
                const [year, month, day] = transaction.date.split('-');
                list.append(el('h3', 'date-heading date-heading-v2', [`${day}/${month}/${year}`]));
            }
            const amount = `${signFor(transaction)}${formatBRL(transaction.amount)}`;
            const iconWrap = el('span', `movement-icon movement-icon-v2 ${amountClass(transaction)}`, [movementIcon(transaction)]);
            const row = el('button', 'movement-row movement-row-v2 movement-button', [
                iconWrap,
                el('div', 'movement-copy', [
                    el('strong', '', [labelFor(transaction)]),
                    el('small', '', [metaFor(transaction, accounts)])
                ]),
                el('div', 'movement-value-v2', [
                    el('b', `movement-amount ${amountClass(transaction)}`, [amount]),
                    el('span', '', ['›'])
                ])
            ]);
            row.type = 'button';
            row.setAttribute('aria-label', `${labelFor(transaction)}, ${amount}. Abrir ações.`);
            row.addEventListener('click', () => openMovementActions(repositories, profile, mutations, transaction, onChanged));
            list.append(row);
        }
    };
    for (const option of options) {
        const button = el('button', 'movement-filter-v2', [option.label]);
        button.type = 'button';
        button.classList.toggle('active', option.id === active);
        button.addEventListener('click', () => {
            active = option.id;
            for (const [id, node] of buttons)
                node.classList.toggle('active', id === active);
            renderList();
        });
        buttons.set(option.id, button);
        filters.append(button);
    }
    renderList();
    root.append(filters, list);
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
