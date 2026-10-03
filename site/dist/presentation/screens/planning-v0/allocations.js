import { createAllocation } from '../../../application/allocations/create-allocation.js';
import { updateAllocationDetails } from '../../../application/allocations/update-allocation.js';
import { formatBRL } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { showToast } from '../../components/feedback.js';
import { planningChoiceFieldV0, planningErrorV0, planningInputFieldV0, planningMoneyFieldV0, planningSubmitV0 } from './controls.js';
import { accountName, accountOptions, activeAccounts, centsToInput, detailRowsV0, emptyPlanningV0, formatDateBR, inlineConfirmV0 } from './shared.js';
export async function renderAllocationListV0(context, actions) {
    const allocations = (await context.repositories.allocations.listByProfile(context.profile.id))
        .filter((item) => item.active)
        .sort((a, b) => a.name.localeCompare(b.name));
    const root = el('div', 'planning-screen-v0 planning-list-screen-v0');
    const top = el('div', 'planning-list-top-v0', [
        el('p', '', ['Valores separados para objetivos. Reservar não movimenta o saldo da conta.'])
    ]);
    const create = el('button', 'planning-inline-primary-v0', ['Nova meta ou reserva']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    top.append(create);
    root.append(top);
    if (allocations.length === 0) {
        root.append(emptyPlanningV0('Nenhuma meta ou reserva cadastrada.'));
        return root;
    }
    const list = el('div', 'planning-entity-list-v0');
    for (const allocation of allocations) {
        const row = el('button', 'planning-entity-row-v0', [
            el('span', 'planning-entity-copy-v0', [
                el('strong', '', [allocation.name]),
                el('small', '', [allocation.protected ? 'Reduz o Livre para decidir' : 'Somente acompanhamento'])
            ]),
            el('span', 'planning-entity-value-v0', [
                el('strong', '', [formatBRL(allocation.amount)]),
                el('small', '', [allocation.targetAmount !== undefined ? `Objetivo ${formatBRL(allocation.targetAmount)}` : 'Valor reservado'])
            ]),
            el('span', 'planning-entity-chevron-v0', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(allocation.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
export async function renderAllocationDetailV0(context, allocationId, actions) {
    const [allocation, accounts] = await Promise.all([
        context.repositories.allocations.getById(allocationId),
        activeAccounts(context)
    ]);
    if (!allocation || allocation.profileId !== context.profile.id || !allocation.active)
        throw new TypeError('Meta ou reserva não encontrada.');
    const root = el('div', 'planning-screen-v0 planning-detail-screen-v0');
    root.append(el('div', 'planning-detail-hero-v0', [
        el('small', '', ['VALOR RESERVADO']),
        el('strong', '', [formatBRL(allocation.amount)]),
        el('span', '', [allocation.name])
    ]), detailRowsV0([
        { label: 'Conta associada', value: accountName(accounts, allocation.accountId) },
        { label: 'Objetivo', value: allocation.targetAmount !== undefined ? formatBRL(allocation.targetAmount) : 'Não definido' },
        { label: 'Prazo', value: allocation.goalDate ? formatDateBR(allocation.goalDate) : 'Não definido' },
        { label: 'Reduz o Livre para decidir', value: allocation.protected ? 'Sim' : 'Não' }
    ]));
    if (allocation.description)
        root.append(el('p', 'planning-detail-note-v0', [allocation.description]));
    const actionsBlock = el('div', 'planning-action-stack-v0');
    const adjust = el('button', 'planning-primary-action-v0', ['Ajustar valor reservado']);
    adjust.type = 'button';
    adjust.addEventListener('click', actions.onAdjust);
    const edit = el('button', 'planning-secondary-action-v0', ['Editar informações']);
    edit.type = 'button';
    edit.addEventListener('click', actions.onEdit);
    actionsBlock.append(adjust, edit);
    root.append(actionsBlock);
    root.append(inlineConfirmV0('Desativar meta ou reserva', 'O saldo da conta não será alterado. A meta deixará de reduzir o Livre para decidir.', 'Desativar', () => {
        void context.lifecycle.deactivate(context.profile.id, 'allocation', allocation.id)
            .then(() => { showToast('Meta ou reserva desativada.', 'success'); actions.onDeactivated(); })
            .catch((error) => showToast(error instanceof Error ? error.message : 'Falha ao desativar meta ou reserva.', 'error'));
    }));
    return root;
}
export async function renderNewAllocationV0(context, actions) {
    const accounts = await activeAccounts(context);
    if (accounts.length === 0)
        throw new TypeError('Cadastre uma conta antes de criar uma meta ou reserva.');
    const account = planningChoiceFieldV0('Conta associada', accountOptions(accounts), '');
    const name = planningInputFieldV0('Nome', 'text');
    name.input.placeholder = 'Ex.: Reserva de emergência';
    const amount = planningMoneyFieldV0('Valor reservado');
    const target = planningMoneyFieldV0('Objetivo total');
    const goalDate = planningInputFieldV0('Prazo', 'date');
    const protection = planningChoiceFieldV0('Reduzir o Livre para decidir?', [
        { value: 'yes', label: 'Sim', description: 'Esse valor fica separado do dinheiro livre para usar.' },
        { value: 'no', label: 'Não', description: 'A meta é acompanhada sem reduzir o Livre.' }
    ], 'yes');
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar meta ou reserva');
    const form = el('form', 'planning-form-v0', [account.element, name.element, amount.element, target.element, goalDate.element, protection.element, error.element, submit]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        if (!account.control.value) {
            submit.disabled = false;
            error.show('Selecione a conta associada.');
            return;
        }
        void createAllocation(context.repositories.allocations, context.repositories.accounts, context.repositories.transactions, {
            profileId: context.profile.id,
            accountId: account.control.value,
            name: name.input.value,
            amount: amount.input.value,
            ...(target.input.value ? { targetAmount: target.input.value } : {}),
            ...(goalDate.input.value ? { goalDate: goalDate.input.value } : {}),
            protected: protection.control.value === 'yes'
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível criar a meta ou reserva.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
export async function renderEditAllocationV0(context, allocationId, actions) {
    const allocation = await context.repositories.allocations.getById(allocationId);
    if (!allocation || allocation.profileId !== context.profile.id || !allocation.active)
        throw new TypeError('Meta ou reserva não encontrada.');
    const name = planningInputFieldV0('Nome', 'text', allocation.name);
    const target = planningMoneyFieldV0('Objetivo total', allocation.targetAmount !== undefined ? centsToInput(allocation.targetAmount) : '');
    const goalDate = planningInputFieldV0('Prazo', 'date', allocation.goalDate ?? '');
    const protection = planningChoiceFieldV0('Reduzir o Livre para decidir?', [
        { value: 'yes', label: 'Sim' },
        { value: 'no', label: 'Não' }
    ], allocation.protected ? 'yes' : 'no');
    const description = planningInputFieldV0('Descrição', 'text', allocation.description ?? '');
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar alterações');
    const reserved = el('div', 'planning-static-field-v0', [
        el('span', 'planning-field-label-v0', ['Valor reservado']),
        el('strong', '', [formatBRL(allocation.amount)]),
        el('small', '', ['Use “Ajustar valor reservado” no detalhe para mudar este valor.'])
    ]);
    const form = el('form', 'planning-form-v0', [name.element, reserved, target.element, goalDate.element, protection.element, description.element, error.element, submit]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        void updateAllocationDetails(context.repositories.allocations, context.repositories.accounts, context.repositories.transactions, context.lifecycle, {
            profileId: context.profile.id,
            allocationId: allocation.id,
            name: name.input.value,
            amount: centsToInput(allocation.amount),
            ...(target.input.value ? { targetAmount: target.input.value } : {}),
            ...(goalDate.input.value ? { goalDate: goalDate.input.value } : {}),
            protected: protection.control.value === 'yes',
            ...(description.input.value.trim() ? { description: description.input.value.trim() } : {})
        }).then(() => actions.onSaved(allocation.id))
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar as alterações.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
export async function renderAdjustAllocationV0(context, allocationId, actions) {
    const allocation = await context.repositories.allocations.getById(allocationId);
    if (!allocation || allocation.profileId !== context.profile.id || !allocation.active)
        throw new TypeError('Meta ou reserva não encontrada.');
    const amount = planningMoneyFieldV0('Novo valor reservado', centsToInput(allocation.amount));
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar novo valor');
    const form = el('form', 'planning-form-v0', [
        el('p', 'planning-form-support-v0', ['Isso altera apenas quanto do dinheiro existente fica reservado. Nenhuma movimentação bancária será criada.']),
        amount.element, error.element, submit
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        void updateAllocationDetails(context.repositories.allocations, context.repositories.accounts, context.repositories.transactions, context.lifecycle, {
            profileId: context.profile.id,
            allocationId: allocation.id,
            name: allocation.name,
            amount: amount.input.value,
            ...(allocation.targetAmount !== undefined ? { targetAmount: centsToInput(allocation.targetAmount) } : {}),
            ...(allocation.goalDate ? { goalDate: allocation.goalDate } : {}),
            protected: allocation.protected,
            ...(allocation.description ? { description: allocation.description } : {})
        }).then(() => { showToast('Valor reservado ajustado.', 'success'); actions.onCompleted(); })
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível ajustar o valor reservado.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
