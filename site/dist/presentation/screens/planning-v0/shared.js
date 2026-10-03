import { effectiveRecurrenceStatus } from '../../../domain/recurrences/position.js';
import { el } from '../../dom.js';
export function todayISO(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function currentMonth(now = new Date()) {
    return todayISO(now).slice(0, 7);
}
export function centsToInput(value) {
    return (value / 100).toFixed(2).replace('.', ',');
}
export function formatDateBR(value) {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}
export function formatMonthBR(value) {
    const [year, month] = value.split('-');
    return year && month ? `${month}/${year}` : value;
}
export async function activeAccounts(context) {
    const accounts = await context.repositories.accounts.listByProfile(context.profile.id);
    return accounts.filter((item) => item.active);
}
export function accountOptions(accounts, includeEmpty = false) {
    const options = accounts.map((item) => ({ value: item.id, label: item.name }));
    return includeEmpty ? [{ value: '', label: 'Sem conta definida' }, ...options] : options;
}
export function accountName(accounts, accountId) {
    if (!accountId)
        return 'Não definida';
    return accounts.find((item) => item.id === accountId)?.name ?? 'Conta não disponível';
}
export function commitmentStatusV0(recurrence, monthStates, now = new Date()) {
    const month = currentMonth(now);
    if (recurrence.startMonth > month)
        return 'future';
    if (recurrence.endMonth && recurrence.endMonth < month)
        return 'ended';
    const state = monthStates.find((item) => item.recurrenceId === recurrence.id && item.month === month);
    return effectiveRecurrenceStatus(recurrence, month, state, todayISO(now));
}
export function commitmentStatusLabelV0(status) {
    if (status === 'planned')
        return 'Previsto';
    if (status === 'overdue')
        return 'Atrasado';
    if (status === 'paid')
        return 'Pago';
    if (status === 'ignored')
        return 'Ignorado';
    if (status === 'future')
        return 'Ainda não iniciou';
    return 'Período encerrado';
}
export function detailRowsV0(rows) {
    const list = el('dl', 'planning-detail-list-v0');
    for (const row of rows) {
        list.append(el('div', 'planning-detail-row-v0', [
            el('dt', '', [row.label]),
            el('dd', '', [row.value])
        ]));
    }
    return list;
}
export function emptyPlanningV0(message) {
    return el('div', 'planning-empty-v0', [message]);
}
export function sectionHeadingV0(title, support) {
    return el('div', 'planning-section-heading-v0', [
        el('h2', '', [title]),
        support ? el('p', '', [support]) : null
    ]);
}
export function inlineConfirmV0(label, message, confirmLabel, onConfirm) {
    const trigger = el('button', 'planning-danger-action-v0', [label]);
    trigger.type = 'button';
    const panel = el('div', 'planning-confirm-v0');
    panel.hidden = true;
    const cancel = el('button', 'planning-secondary-action-v0', ['Cancelar']);
    cancel.type = 'button';
    const confirm = el('button', 'planning-danger-confirm-v0', [confirmLabel]);
    confirm.type = 'button';
    panel.append(el('p', '', [message]), el('div', 'planning-confirm-actions-v0', [cancel, confirm]));
    trigger.addEventListener('click', () => { panel.hidden = false; trigger.hidden = true; });
    cancel.addEventListener('click', () => { panel.hidden = true; trigger.hidden = false; });
    confirm.addEventListener('click', () => { confirm.disabled = true; onConfirm(); });
    return el('div', 'planning-danger-zone-v0', [trigger, panel]);
}
