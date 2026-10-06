import { calculateCashBalances, calculatePeriodSummary } from '../../domain/ledger/ledger.js';
import { effectiveRecurrenceStatus } from '../../domain/recurrences/position.js';
import { getFinancialPosition } from '../planning/get-financial-position.js';
import { financialStatusFor } from './financial-status.js';
function monthPrefix(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
function dayKey(date = new Date()) {
    return `${monthPrefix(date)}-${String(date.getDate()).padStart(2, '0')}`;
}
function dueDateForMonth(month, dayOfMonth) {
    const [yearText, monthText] = month.split('-');
    const year = Number(yearText);
    const monthNumber = Number(monthText);
    const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const day = Math.min(Math.max(dayOfMonth, 1), lastDay);
    return `${month}-${String(day).padStart(2, '0')}`;
}
export async function getDashboardSnapshot(repositories, profileId, now = new Date()) {
    const [accountsRaw, transactions, investmentTrades, position] = await Promise.all([
        repositories.accounts.listByProfile(profileId),
        repositories.transactions.listByProfile(profileId),
        repositories.investmentTrades.listByProfile(profileId),
        getFinancialPosition(repositories, profileId, now)
    ]);
    const accounts = accountsRaw.filter((account) => account.active);
    const balances = calculateCashBalances(accounts, transactions, investmentTrades);
    const availableNow = position.availableNow;
    const prefix = monthPrefix(now);
    const today = dayKey(now);
    const monthTransactions = transactions.filter((transaction) => transaction.date.startsWith(prefix));
    const summary = calculatePeriodSummary(monthTransactions);
    const upcomingCommitments = position.recurrences
        .filter((recurrence) => recurrence.kind === 'expense'
        && recurrence.startMonth <= prefix
        && (recurrence.endMonth === undefined || recurrence.endMonth >= prefix))
        .map((recurrence) => {
        const state = position.recurrenceMonths.find((item) => item.recurrenceId === recurrence.id && item.month === prefix);
        const status = effectiveRecurrenceStatus(recurrence, prefix, state, today);
        if (status !== 'planned' && status !== 'overdue')
            return null;
        return {
            id: recurrence.id,
            name: recurrence.name,
            amount: recurrence.amount,
            dueDate: dueDateForMonth(prefix, recurrence.dayOfMonth),
            status
        };
    })
        .filter((item) => item !== null)
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate) || left.name.localeCompare(right.name, 'pt-BR'))
        .slice(0, 3);
    const debtOutstanding = position.debts.reduce((total, item) => total + item.position.outstanding, 0);
    const debtOpening = position.debts.reduce((total, item) => total + item.debt.openingBalance, 0);
    const debtPaid = position.debts.reduce((total, item) => total + item.position.paid, 0);
    const allocations = position.allocations.map((allocation) => ({
        id: allocation.id,
        name: allocation.name,
        amount: allocation.amount,
        ...(allocation.targetAmount !== undefined ? { targetAmount: allocation.targetAmount } : {})
    }));
    return {
        accounts,
        transactions,
        balances,
        availableNow,
        incomeMonth: summary.income,
        expenseMonth: summary.expenseRecognized,
        resultMonth: summary.operatingResult,
        monthTransactionCount: monthTransactions.length,
        freeToDecide: position.freeToDecide,
        netWorth: position.netWorth.netWorth,
        plannedExpense: position.commitments.plannedExpense,
        allocated: position.totalAllocated,
        allocations,
        debtOutstanding,
        debtOpening,
        debtPaid,
        status: financialStatusFor({
            availableNow,
            freeToDecide: position.freeToDecide,
            resultMonth: summary.operatingResult,
            plannedExpense: position.commitments.plannedExpense,
            allocated: position.totalAllocated
        }),
        upcomingCommitments
    };
}
