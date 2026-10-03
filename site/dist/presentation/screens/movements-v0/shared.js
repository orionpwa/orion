export const DEFAULT_MOVEMENT_FILTERS_V0 = {
    period: 'all',
    nature: 'all',
    accountId: '',
    category: '',
    startDate: '',
    endDate: ''
};
export function localIsoDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
export function movementLabel(transaction) {
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
export function movementKindLabel(transaction) {
    switch (transaction.kind) {
        case 'income': return 'Receita';
        case 'yield': return 'Rendimento';
        case 'expense': return 'Despesa';
        case 'transfer': return 'Transferência';
        case 'credit-card-payment': return 'Pagamento de fatura';
        case 'debt-payment': return 'Pagamento de dívida';
        case 'asset-contribution': return 'Aporte em ativo';
        case 'asset-withdrawal': return 'Resgate de ativo';
        case 'asset-yield': return 'Rendimento de ativo';
        case 'asset-valuation': return 'Atualização patrimonial';
        default: {
            const exhaustive = transaction;
            return exhaustive;
        }
    }
}
export function movementMeta(transaction, accountMap) {
    if ('categoryId' in transaction && transaction.categoryId)
        return transaction.categoryId;
    if (transaction.kind === 'transfer') {
        const from = accountMap.get(transaction.fromAccountId)?.name ?? 'Origem';
        const to = accountMap.get(transaction.toAccountId)?.name ?? 'Destino';
        return `${from} → ${to}`;
    }
    return movementKindLabel(transaction);
}
export function movementSign(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield' || transaction.kind === 'asset-yield')
        return '+';
    if (transaction.kind === 'expense')
        return '−';
    if (transaction.kind === 'asset-valuation' && transaction.amount > 0)
        return '+';
    return '';
}
export function movementTone(transaction) {
    if (transaction.kind === 'income' || transaction.kind === 'yield' || transaction.kind === 'asset-yield')
        return 'positive';
    if (transaction.kind === 'expense')
        return 'negative';
    if (transaction.kind === 'asset-valuation')
        return transaction.amount >= 0 ? 'positive' : 'negative';
    return 'neutral';
}
export function movementNature(transaction) {
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
export function accountIdsForMovement(transaction) {
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
function dateAllowed(date, filters, now = new Date()) {
    if (filters.period === 'all')
        return true;
    const todayIso = localIsoDate(now);
    if (filters.period === 'today')
        return date === todayIso;
    if (filters.period === 'month')
        return date.startsWith(todayIso.slice(0, 7));
    if (filters.period === '7d') {
        const start = new Date(now);
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
export function movementVisible(transaction, filters, now = new Date()) {
    if (!dateAllowed(transaction.date, filters, now))
        return false;
    if (filters.nature !== 'all' && movementNature(transaction) !== filters.nature)
        return false;
    if (filters.accountId && !accountIdsForMovement(transaction).includes(filters.accountId))
        return false;
    if (filters.category && (!('categoryId' in transaction) || transaction.categoryId !== filters.category))
        return false;
    return true;
}
export function activeMovementFilterCount(filters) {
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
export function sortMovementsNewestFirst(transactions) {
    return [...transactions].sort((left, right) => {
        const byDate = right.date.localeCompare(left.date);
        if (byDate !== 0)
            return byDate;
        return (right.createdAt ?? right.id).localeCompare(left.createdAt ?? left.id);
    });
}
