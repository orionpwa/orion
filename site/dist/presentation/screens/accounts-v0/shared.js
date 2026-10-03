import { ACCOUNT_TYPE_OPTIONS } from '../../../catalog/account-types.js';
import { getInstitution } from '../../../catalog/institutions.js';
import { accountIdsForMovement, movementLabel, sortMovementsNewestFirst } from '../../screens/movements-v0/shared.js';
export function accountTypeLabel(account) {
    return ACCOUNT_TYPE_OPTIONS.find((option) => option.value === account.type)?.label ?? 'Conta';
}
export function accountInstitutionLabel(account) {
    return getInstitution(account.institutionId)?.name ?? 'Outra instituição';
}
export function accountMovements(transactions, accountId) {
    return sortMovementsNewestFirst(transactions.filter((transaction) => accountIdsForMovement(transaction).includes(accountId)));
}
export function accountMovementAmount(transaction, accountId) {
    if (transaction.kind === 'income' || transaction.kind === 'yield')
        return { sign: '+', tone: 'positive' };
    if (transaction.kind === 'expense' || transaction.kind === 'debt-payment' || transaction.kind === 'asset-contribution')
        return { sign: '−', tone: 'negative' };
    if (transaction.kind === 'credit-card-payment') {
        return transaction.source.kind === 'account' && transaction.source.accountId === accountId
            ? { sign: '−', tone: 'negative' }
            : { sign: '', tone: 'neutral' };
    }
    if (transaction.kind === 'asset-withdrawal')
        return { sign: '+', tone: 'positive' };
    if (transaction.kind === 'transfer') {
        if (transaction.fromAccountId === accountId)
            return { sign: '−', tone: 'negative' };
        if (transaction.toAccountId === accountId)
            return { sign: '+', tone: 'positive' };
    }
    return { sign: '', tone: 'neutral' };
}
export function accountMovementLabel(transaction) {
    return movementLabel(transaction);
}
export function formatDateBR(value) {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}
