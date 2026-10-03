import { updateRecurrenceMonth } from '../../../application/recurrences/update-recurrence-month.js';
import { unlinkRecurrencePayment } from '../../../application/recurrences/payment-link.js';
import { formatBRL } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { showToast } from '../../components/feedback.js';
import { deactivateWithUndoFeedback } from '../../components/lifecycle-feedback.js';
import { accountName, activeAccounts, commitmentStatusLabelV0, commitmentStatusV0, currentMonth, detailRowsV0, emptyPlanningV0, formatMonthBR, inlineConfirmV0 } from './shared.js';
export async function renderCommitmentListV0(context, actions) {
    const [recurrences, monthStates] = await Promise.all([
        context.repositories.recurrences.listByProfile(context.profile.id),
        context.repositories.recurrenceMonths.listByProfile(context.profile.id)
    ]);
    const active = recurrences.filter((item) => item.active).sort((a, b) => a.dayOfMonth - b.dayOfMonth || a.name.localeCompare(b.name));
    const root = el('div', 'planning-screen-v0 planning-list-screen-v0');
    const top = el('div', 'planning-list-top-v0', [
        el('p', '', ['Previsões recorrentes. Só viram fatos financeiros quando você registrar ou vincular o pagamento ou recebimento.'])
    ]);
    const create = el('button', 'planning-inline-primary-v0', ['Novo compromisso']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    top.append(create);
    root.append(top);
    if (active.length === 0) {
        root.append(emptyPlanningV0('Nenhum compromisso cadastrado.'));
        return root;
    }
    const list = el('div', 'planning-entity-list-v0');
    for (const recurrence of active) {
        const status = commitmentStatusV0(recurrence, monthStates);
        const row = el('button', 'planning-entity-row-v0', [
            el('span', 'planning-entity-copy-v0', [
                el('strong', '', [recurrence.name]),
                el('small', '', [`Dia ${recurrence.dayOfMonth} · ${commitmentStatusLabelV0(status)}`])
            ]),
            el('span', 'planning-entity-value-v0', [
                el('strong', '', [formatBRL(recurrence.amount)]),
                el('small', '', [recurrence.kind === 'expense' ? 'A pagar' : 'A receber'])
            ]),
            el('span', 'planning-entity-chevron-v0', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(recurrence.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
export async function renderCommitmentDetailV0(context, recurrenceId, actions) {
    const [recurrence, monthStates, accounts] = await Promise.all([
        context.repositories.recurrences.getById(recurrenceId),
        context.repositories.recurrenceMonths.listByProfile(context.profile.id),
        activeAccounts(context)
    ]);
    if (!recurrence || recurrence.profileId !== context.profile.id || !recurrence.active)
        throw new TypeError('Compromisso não encontrado.');
    const status = commitmentStatusV0(recurrence, monthStates);
    const month = currentMonth();
    const monthState = monthStates.find((item) => item.recurrenceId === recurrence.id && item.month === month);
    const currentMonthApplicable = status !== 'future' && status !== 'ended';
    const root = el('div', 'planning-screen-v0 planning-detail-screen-v0');
    root.append(el('div', 'planning-detail-hero-v0', [
        el('small', '', [recurrence.kind === 'expense' ? 'A PAGAR' : 'A RECEBER']),
        el('strong', '', [formatBRL(recurrence.amount)]),
        el('span', '', [recurrence.name])
    ]), detailRowsV0([
        { label: 'Estado neste mês', value: commitmentStatusLabelV0(status) },
        { label: 'Dia do mês', value: String(recurrence.dayOfMonth) },
        { label: 'Tipo', value: recurrence.kind === 'expense' ? 'Conta a pagar' : 'Dinheiro a receber' },
        { label: 'Conta', value: accountName(accounts, recurrence.accountId) },
        { label: 'Importância', value: recurrence.priority === 'flexible' ? 'Flexível' : 'Essencial' },
        { label: 'Começa em', value: formatMonthBR(recurrence.startMonth) },
        ...(recurrence.endMonth ? [{ label: 'Termina em', value: formatMonthBR(recurrence.endMonth) }] : [])
    ]));
    if (recurrence.note)
        root.append(el('p', 'planning-detail-note-v0', [recurrence.note]));
    const actionStack = el('div', 'planning-action-stack-v0');
    if (currentMonthApplicable && (status === 'planned' || status === 'overdue')) {
        const payment = el('button', 'planning-primary-action-v0', [recurrence.kind === 'expense' ? 'Registrar pagamento' : 'Registrar recebimento']);
        payment.type = 'button';
        payment.addEventListener('click', actions.onPayment);
        const ignore = el('button', 'planning-secondary-action-v0', ['Ignorar compromisso neste mês']);
        ignore.type = 'button';
        ignore.addEventListener('click', () => {
            ignore.disabled = true;
            void updateRecurrenceMonth(context.repositories.recurrenceMonths, context.repositories.recurrences, context.repositories.transactions, {
                profileId: context.profile.id, recurrenceId: recurrence.id, month, status: 'ignored'
            }).then(() => { showToast('Compromisso ignorado neste mês.', 'success'); actions.onChanged(); })
                .catch((error) => { ignore.disabled = false; showToast(error instanceof Error ? error.message : 'Falha ao atualizar compromisso.', 'error'); });
        });
        actionStack.append(payment, ignore);
    }
    else if (currentMonthApplicable && status === 'ignored') {
        const reconsider = el('button', 'planning-primary-action-v0', ['Voltar a considerar']);
        reconsider.type = 'button';
        reconsider.addEventListener('click', () => {
            reconsider.disabled = true;
            void updateRecurrenceMonth(context.repositories.recurrenceMonths, context.repositories.recurrences, context.repositories.transactions, {
                profileId: context.profile.id, recurrenceId: recurrence.id, month, status: 'planned'
            }).then(() => { showToast('Compromisso voltou ao planejamento.', 'success'); actions.onChanged(); })
                .catch((error) => { reconsider.disabled = false; showToast(error instanceof Error ? error.message : 'Falha ao atualizar compromisso.', 'error'); });
        });
        actionStack.append(reconsider);
    }
    else if (currentMonthApplicable && status === 'paid' && monthState?.linkedTransactionId) {
        const unlink = el('button', 'planning-secondary-action-v0', [recurrence.kind === 'expense' ? 'Desvincular pagamento' : 'Desvincular recebimento']);
        unlink.type = 'button';
        unlink.addEventListener('click', () => {
            unlink.disabled = true;
            void unlinkRecurrencePayment(context.repositories.recurrenceMonths, context.repositories.recurrences, context.repositories.transactions, {
                profileId: context.profile.id, recurrenceId: recurrence.id, month
            }).then(() => { showToast('Vínculo removido. A movimentação foi preservada.', 'success'); actions.onChanged(); })
                .catch((error) => { unlink.disabled = false; showToast(error instanceof Error ? error.message : 'Falha ao desvincular.', 'error'); });
        });
        actionStack.append(unlink);
    }
    const edit = el('button', 'planning-secondary-action-v0', ['Editar']);
    edit.type = 'button';
    edit.addEventListener('click', actions.onEdit);
    actionStack.append(edit);
    root.append(actionStack);
    root.append(inlineConfirmV0('Desativar compromisso', 'O histórico já registrado será preservado. O compromisso deixará de aparecer nos próximos planejamentos.', 'Desativar', () => {
        deactivateWithUndoFeedback(context.lifecycle, context.profile.id, 'recurrence', recurrence.id, 'Compromisso', actions.onDeactivated);
    }));
    return root;
}
