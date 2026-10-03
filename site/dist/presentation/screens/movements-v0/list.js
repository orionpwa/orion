import { formatBRL } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { activeMovementFilterCount, movementLabel, movementMeta, movementSign, movementTone, movementVisible, sortMovementsNewestFirst } from './shared.js';
function dateHeading(dateKey) {
    const [year, month, day] = dateKey.split('-');
    return `${day ?? '--'}/${month ?? '--'}/${year ?? '----'}`;
}
export async function renderMovementListV0(repositories, profile, filters, actions) {
    const [transactionsRaw, accounts] = await Promise.all([
        repositories.transactions.listByProfile(profile.id),
        repositories.accounts.listByProfile(profile.id)
    ]);
    const accountMap = new Map(accounts.map((account) => [account.id, account]));
    const transactions = sortMovementsNewestFirst(transactionsRaw);
    const visible = transactions.filter((transaction) => movementVisible(transaction, filters));
    const activeCount = activeMovementFilterCount(filters);
    const root = el('div', 'movements-screen-v0');
    const filterButton = el('button', 'movements-filter-button-v0', [
        el('span', '', [activeCount > 0 ? `Filtros (${activeCount})` : 'Filtros']),
        el('span', 'movements-filter-chevron-v0', ['›'])
    ]);
    filterButton.type = 'button';
    filterButton.addEventListener('click', actions.onOpenFilters);
    root.append(el('div', 'movements-toolbar-v0', [filterButton]));
    if (visible.length === 0) {
        if (transactions.length === 0) {
            root.append(el('section', 'movements-empty-v0', [
                el('strong', '', ['Ainda não há movimentações.']),
                el('span', '', ['Use “Novo” no topo para registrar sua primeira movimentação.'])
            ]));
        }
        else {
            const clear = el('button', 'movements-text-action-v0', ['Limpar filtros']);
            clear.type = 'button';
            clear.addEventListener('click', actions.onClearFilters);
            root.append(el('section', 'movements-empty-v0', [
                el('strong', '', ['Nenhum movimento com estes filtros.']),
                clear
            ]));
        }
        return root;
    }
    const list = el('section', 'movements-list-v0');
    let lastDate = '';
    for (const transaction of visible) {
        if (transaction.date !== lastDate) {
            lastDate = transaction.date;
            list.append(el('h2', 'movements-date-v0', [dateHeading(transaction.date)]));
        }
        const amount = `${movementSign(transaction)}${formatBRL(transaction.amount)}`;
        const row = el('button', 'movement-row-v0', [
            el('div', 'movement-row-copy-v0', [
                el('strong', 'movement-row-title-v0', [movementLabel(transaction)]),
                el('span', 'movement-row-meta-v0', [movementMeta(transaction, accountMap)])
            ]),
            el('strong', `movement-row-value-v0 ${movementTone(transaction)}`, [amount])
        ]);
        row.type = 'button';
        row.setAttribute('aria-label', `${movementLabel(transaction)}, ${amount}. Abrir detalhes.`);
        row.addEventListener('click', () => actions.onOpenDetail(transaction.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
