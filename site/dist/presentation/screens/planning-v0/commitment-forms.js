import { createRecurrence } from '../../../application/recurrences/create-recurrence.js';
import { updateRecurrenceDetails } from '../../../application/recurrences/update-recurrence.js';
import { el } from '../../dom.js';
import { planningChoiceFieldV0, planningErrorV0, planningInputFieldV0, planningMoneyFieldV0, planningSubmitV0 } from './controls.js';
import { accountOptions, activeAccounts, centsToInput, currentMonth } from './shared.js';
export async function renderNewCommitmentV0(context, actions) {
    const accounts = await activeAccounts(context);
    const kind = planningChoiceFieldV0('Tipo', [
        { value: 'expense', label: 'Conta a pagar' },
        { value: 'income', label: 'Dinheiro a receber' }
    ], 'expense');
    const name = planningInputFieldV0('Nome', 'text');
    name.input.placeholder = 'Ex.: Internet';
    const amount = planningMoneyFieldV0('Valor');
    const day = planningInputFieldV0('Dia do mês', 'number', '', 'numeric');
    day.input.min = '1';
    day.input.max = '31';
    const account = planningChoiceFieldV0('Conta associada', accountOptions(accounts, true), '');
    const priority = planningChoiceFieldV0('Importância', [
        { value: 'essential', label: 'Essencial' },
        { value: 'flexible', label: 'Flexível' }
    ], 'essential');
    const start = planningInputFieldV0('Começa em', 'month', currentMonth());
    const end = planningInputFieldV0('Termina em', 'month');
    const note = planningInputFieldV0('Observação', 'text');
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar compromisso');
    const form = el('form', 'planning-form-v0', [
        kind.element, name.element, amount.element, day.element, account.element, priority.element,
        start.element, end.element, note.element, error.element, submit
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        void createRecurrence(context.repositories.recurrences, context.repositories.accounts, {
            profileId: context.profile.id,
            name: name.input.value,
            kind: kind.control.value,
            amount: amount.input.value,
            dayOfMonth: Number(day.input.value),
            startMonth: start.input.value,
            ...(end.input.value ? { endMonth: end.input.value } : {}),
            ...(account.control.value ? { accountId: account.control.value } : {}),
            priority: priority.control.value,
            ...(note.input.value.trim() ? { note: note.input.value.trim() } : {})
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar o compromisso.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
export async function renderEditCommitmentV0(context, recurrenceId, actions) {
    const [recurrence, accounts] = await Promise.all([
        context.repositories.recurrences.getById(recurrenceId),
        activeAccounts(context)
    ]);
    if (!recurrence || recurrence.profileId !== context.profile.id || !recurrence.active)
        throw new TypeError('Compromisso não encontrado.');
    const name = planningInputFieldV0('Nome', 'text', recurrence.name);
    const amount = planningMoneyFieldV0('Valor', centsToInput(recurrence.amount));
    const day = planningInputFieldV0('Dia do mês', 'number', String(recurrence.dayOfMonth), 'numeric');
    day.input.min = '1';
    day.input.max = '31';
    const account = planningChoiceFieldV0('Conta associada', accountOptions(accounts, true), recurrence.accountId ?? '');
    const priority = planningChoiceFieldV0('Importância', [
        { value: 'essential', label: 'Essencial' },
        { value: 'flexible', label: 'Flexível' }
    ], recurrence.priority ?? 'essential');
    const end = planningInputFieldV0('Termina em', 'month', recurrence.endMonth ?? '');
    const note = planningInputFieldV0('Observação', 'text', recurrence.note ?? '');
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar alterações');
    const typeInfo = el('div', 'planning-static-field-v0', [
        el('span', 'planning-field-label-v0', ['Tipo']),
        el('strong', '', [recurrence.kind === 'expense' ? 'Conta a pagar' : 'Dinheiro a receber'])
    ]);
    const form = el('form', 'planning-form-v0', [typeInfo, name.element, amount.element, day.element, account.element, priority.element, end.element, note.element, error.element, submit]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        void updateRecurrenceDetails(context.repositories.recurrences, context.repositories.accounts, context.lifecycle, {
            profileId: context.profile.id,
            recurrenceId: recurrence.id,
            name: name.input.value,
            amount: amount.input.value,
            dayOfMonth: Number(day.input.value),
            ...(account.control.value ? { accountId: account.control.value } : {}),
            priority: priority.control.value,
            ...(end.input.value ? { endMonth: end.input.value } : {}),
            ...(note.input.value.trim() ? { note: note.input.value.trim() } : {})
        }).then(() => actions.onSaved(recurrence.id))
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar as alterações.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
