import { linkRecurrencePayment, listRecurrencePaymentCandidates } from '../../../application/recurrences/payment-link.js';
import { createTransaction } from '../../../application/transactions/create-transaction.js';
import { formatBRL } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { showToast } from '../../components/feedback.js';
import { planningChoiceFieldV0, planningErrorV0, planningInputFieldV0, planningSubmitV0 } from './controls.js';
import { accountOptions, activeAccounts, centsToInput, currentMonth, emptyPlanningV0, formatDateBR, sectionHeadingV0, todayISO } from './shared.js';
export async function renderCommitmentPaymentV0(context, recurrenceId, actions) {
    const [recurrence, accounts] = await Promise.all([
        context.repositories.recurrences.getById(recurrenceId),
        activeAccounts(context)
    ]);
    if (!recurrence || recurrence.profileId !== context.profile.id || !recurrence.active)
        throw new TypeError('Compromisso não encontrado.');
    const month = currentMonth();
    const candidates = await listRecurrencePaymentCandidates(context.repositories.recurrences, context.repositories.recurrenceMonths, context.repositories.transactions, { profileId: context.profile.id, recurrenceId: recurrence.id, month });
    const root = el('div', 'planning-screen-v0 planning-payment-screen-v0');
    root.append(sectionHeadingV0(recurrence.kind === 'expense' ? 'Usar movimentação existente' : 'Usar recebimento existente', 'O Orion mostra somente fatos compatíveis com valor, mês e conta deste compromisso.'));
    if (candidates.length === 0)
        root.append(emptyPlanningV0('Nenhuma movimentação compatível encontrada.'));
    else {
        const list = el('div', 'planning-candidate-list-v0');
        for (const transaction of candidates) {
            const button = el('button', 'planning-candidate-row-v0', [
                el('span', '', [el('strong', '', [transaction.description?.trim() || 'Movimentação']), el('small', '', [formatDateBR(transaction.date)])]),
                el('strong', '', [formatBRL(transaction.amount)])
            ]);
            button.type = 'button';
            button.addEventListener('click', () => {
                button.disabled = true;
                void linkRecurrencePayment(context.repositories.recurrenceMonths, context.repositories.recurrences, context.repositories.transactions, {
                    profileId: context.profile.id, recurrenceId: recurrence.id, month, transactionId: transaction.id
                }).then(() => { showToast('Movimentação vinculada.', 'success'); actions.onCompleted(); })
                    .catch((error) => { button.disabled = false; showToast(error instanceof Error ? error.message : 'Falha ao vincular movimentação.', 'error'); });
            });
            list.append(button);
        }
        root.append(list);
    }
    root.append(sectionHeadingV0(recurrence.kind === 'expense' ? 'Registrar um novo pagamento' : 'Registrar um novo recebimento', `O valor será ${formatBRL(recurrence.amount)} e o fato será vinculado automaticamente.`));
    const fixedAccount = recurrence.accountId ? accounts.find((item) => item.id === recurrence.accountId) : undefined;
    const account = fixedAccount ? null : planningChoiceFieldV0('Conta', accountOptions(accounts), '');
    const date = planningInputFieldV0('Data', 'date', todayISO());
    const description = planningInputFieldV0('Descrição', 'text', recurrence.name);
    const method = recurrence.kind === 'expense' ? planningChoiceFieldV0('Forma de pagamento', [
        { value: 'pix', label: 'Pix' },
        { value: 'debit', label: 'Débito' },
        { value: 'cash', label: 'Dinheiro' },
        { value: 'other', label: 'Outro' }
    ], 'pix') : null;
    const error = planningErrorV0();
    const submit = planningSubmitV0(recurrence.kind === 'expense' ? 'Registrar pagamento' : 'Registrar recebimento');
    const form = el('form', 'planning-form-v0 planning-payment-form-v0', [
        fixedAccount ? el('div', 'planning-static-field-v0', [el('span', 'planning-field-label-v0', ['Conta']), el('strong', '', [fixedAccount.name])]) : account?.element ?? null,
        date.element,
        description.element,
        method?.element ?? null,
        error.element,
        submit
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        const accountId = (recurrence.accountId ?? account?.control.value);
        if (!accountId) {
            submit.disabled = false;
            error.show('Selecione a conta.');
            return;
        }
        if (!date.input.value.startsWith(`${month}-`)) {
            submit.disabled = false;
            error.show('Use uma data deste mês para registrar esta ocorrência.');
            return;
        }
        const inputAmount = centsToInput(recurrence.amount);
        const create = recurrence.kind === 'expense'
            ? createTransaction(context.repositories.transactions, context.repositories.accounts, {
                kind: 'expense', profileId: context.profile.id, amount: inputAmount, date: date.input.value,
                description: description.input.value, categoryId: recurrence.categoryId ?? 'Outros', accountId,
                paymentMethod: (method?.control.value || 'other')
            })
            : createTransaction(context.repositories.transactions, context.repositories.accounts, {
                kind: 'income', profileId: context.profile.id, amount: inputAmount, date: date.input.value,
                description: description.input.value, categoryId: recurrence.categoryId ?? 'Outros', accountId
            });
        void create.then((transaction) => linkRecurrencePayment(context.repositories.recurrenceMonths, context.repositories.recurrences, context.repositories.transactions, { profileId: context.profile.id, recurrenceId: recurrence.id, month, transactionId: transaction.id })).then(() => { showToast('Fato registrado e compromisso vinculado.', 'success'); actions.onCompleted(); })
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível registrar o fato.'); });
    });
    root.append(form);
    return root;
}
