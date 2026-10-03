import { createDebt } from '../../../application/debts/create-debt.js';
import { updateDebtDetails } from '../../../application/debts/update-debt.js';
import { payDebt } from '../../../application/debts/pay-debt.js';
import { getFinancialPosition } from '../../../application/planning/get-financial-position.js';
import { formatBRL, sumCents, ZERO_CENTS } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { showToast } from '../../components/feedback.js';
import { deactivateWithUndoFeedback } from '../../components/lifecycle-feedback.js';
import { planningChoiceFieldV0, planningErrorV0, planningInputFieldV0, planningMoneyFieldV0, planningSubmitV0 } from './controls.js';
import { accountOptions, activeAccounts, centsToInput, detailRowsV0, emptyPlanningV0, formatDateBR, inlineConfirmV0, sectionHeadingV0, todayISO } from './shared.js';
export async function renderDebtListV0(context, actions) {
    const position = await getFinancialPosition(context.repositories, context.profile.id);
    const items = [...position.debts].sort((a, b) => b.position.outstanding - a.position.outstanding || a.debt.name.localeCompare(b.debt.name));
    const total = sumCents(items.map((item) => item.position.outstanding));
    const root = el('div', 'planning-screen-v0 planning-list-screen-v0');
    const top = el('div', 'planning-list-top-v0', [
        el('p', '', [`Saldo total em aberto: ${formatBRL(total)}.`])
    ]);
    const create = el('button', 'planning-inline-primary-v0', ['Nova dívida']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    top.append(create);
    root.append(top);
    if (items.length === 0) {
        root.append(emptyPlanningV0('Nenhuma dívida cadastrada.'));
        return root;
    }
    const list = el('div', 'planning-entity-list-v0');
    for (const item of items) {
        const row = el('button', 'planning-entity-row-v0', [
            el('span', 'planning-entity-copy-v0', [
                el('strong', '', [item.debt.name]),
                el('small', '', [item.debt.creditor?.trim() || 'Dívida em aberto'])
            ]),
            el('span', 'planning-entity-value-v0', [
                el('strong', '', [formatBRL(item.position.outstanding)]),
                el('small', '', ['Saldo restante'])
            ]),
            el('span', 'planning-entity-chevron-v0', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(item.debt.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
export async function renderDebtDetailV0(context, debtId, actions) {
    const [position, transactions] = await Promise.all([
        getFinancialPosition(context.repositories, context.profile.id),
        context.repositories.transactions.listByProfile(context.profile.id)
    ]);
    const item = position.debts.find((entry) => entry.debt.id === debtId);
    if (!item)
        throw new TypeError('Dívida não encontrada.');
    const history = transactions
        .filter((transaction) => transaction.kind === 'debt-payment' && transaction.debtId === debtId)
        .sort((a, b) => b.date.localeCompare(a.date));
    const root = el('div', 'planning-screen-v0 planning-detail-screen-v0');
    root.append(el('div', 'planning-detail-hero-v0', [
        el('small', '', ['SALDO RESTANTE']),
        el('strong', '', [formatBRL(item.position.outstanding)]),
        el('span', '', [item.debt.name])
    ]), detailRowsV0([
        { label: 'Credor', value: item.debt.creditor?.trim() || 'Não informado' },
        { label: 'Saldo inicial', value: formatBRL(item.debt.openingBalance) },
        { label: 'Total pago', value: formatBRL(item.position.paid) },
        ...(item.position.settlementOffer !== undefined ? [{ label: 'Oferta para quitar', value: formatBRL(item.position.settlementOffer) }] : []),
        ...(item.debt.offerExpiry ? [{ label: 'Oferta válida até', value: formatDateBR(item.debt.offerExpiry) }] : [])
    ]));
    const actionStack = el('div', 'planning-action-stack-v0');
    if (item.position.outstanding > ZERO_CENTS) {
        const pay = el('button', 'planning-primary-action-v0', ['Registrar pagamento']);
        pay.type = 'button';
        pay.addEventListener('click', actions.onPayment);
        actionStack.append(pay);
    }
    const edit = el('button', 'planning-secondary-action-v0', ['Editar']);
    edit.type = 'button';
    edit.addEventListener('click', actions.onEdit);
    actionStack.append(edit);
    root.append(actionStack);
    root.append(sectionHeadingV0('Histórico de pagamentos'));
    if (history.length === 0)
        root.append(emptyPlanningV0('Nenhum pagamento registrado.'));
    else {
        const list = el('div', 'planning-history-list-v0');
        for (const transaction of history) {
            list.append(el('div', 'planning-history-row-v0', [
                el('span', '', [el('strong', '', [formatDateBR(transaction.date)]), el('small', '', [transaction.description ?? 'Pagamento'])]),
                el('strong', '', [formatBRL(transaction.amount)])
            ]));
        }
        root.append(list);
    }
    root.append(inlineConfirmV0('Desativar dívida', 'Os pagamentos já registrados serão preservados. A dívida deixará de aparecer no planejamento ativo.', 'Desativar', () => {
        deactivateWithUndoFeedback(context.lifecycle, context.profile.id, 'debt', item.debt.id, 'Dívida', actions.onDeactivated);
    }));
    return root;
}
export function renderNewDebtV0(context, actions) {
    const name = planningInputFieldV0('Nome', 'text');
    name.input.placeholder = 'Ex.: Empréstimo pessoal';
    const creditor = planningInputFieldV0('Credor', 'text');
    const balance = planningMoneyFieldV0('Quanto falta pagar');
    const hasOffer = planningChoiceFieldV0('Possui oferta para quitar?', [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' }
    ], 'no');
    const offer = planningMoneyFieldV0('Valor da oferta');
    const expiry = planningInputFieldV0('Validade da oferta', 'date');
    const offerGroup = el('div', 'planning-conditional-group-v0', [offer.element, expiry.element]);
    offerGroup.hidden = true;
    hasOffer.control.addEventListener('change', () => { offerGroup.hidden = hasOffer.control.value !== 'yes'; });
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar dívida');
    const form = el('form', 'planning-form-v0', [name.element, creditor.element, balance.element, hasOffer.element, offerGroup, error.element, submit]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        if (hasOffer.control.value === 'yes' && !offer.input.value.trim()) {
            submit.disabled = false;
            error.show('Informe o valor da oferta para quitar.');
            return;
        }
        void createDebt(context.repositories.debts, {
            profileId: context.profile.id,
            name: name.input.value,
            openingBalance: balance.input.value,
            ...(creditor.input.value.trim() ? { creditor: creditor.input.value.trim() } : {}),
            ...(hasOffer.control.value === 'yes' ? { settlementOffer: offer.input.value } : {}),
            ...(hasOffer.control.value === 'yes' && expiry.input.value ? { offerExpiry: expiry.input.value } : {})
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível criar a dívida.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
export async function renderEditDebtV0(context, debtId, actions) {
    const debt = await context.repositories.debts.getById(debtId);
    if (!debt || debt.profileId !== context.profile.id || !debt.active)
        throw new TypeError('Dívida não encontrada.');
    const name = planningInputFieldV0('Nome', 'text', debt.name);
    const creditor = planningInputFieldV0('Credor', 'text', debt.creditor ?? '');
    const hasOffer = planningChoiceFieldV0('Possui oferta para quitar?', [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' }
    ], debt.settlementOffer !== undefined ? 'yes' : 'no');
    const offer = planningMoneyFieldV0('Valor da oferta', debt.settlementOffer !== undefined ? centsToInput(debt.settlementOffer) : '');
    const expiry = planningInputFieldV0('Validade da oferta', 'date', debt.offerExpiry ?? '');
    const offerGroup = el('div', 'planning-conditional-group-v0', [offer.element, expiry.element]);
    offerGroup.hidden = hasOffer.control.value !== 'yes';
    hasOffer.control.addEventListener('change', () => { offerGroup.hidden = hasOffer.control.value !== 'yes'; });
    const error = planningErrorV0();
    const submit = planningSubmitV0('Salvar alterações');
    const balanceInfo = el('div', 'planning-static-field-v0', [
        el('span', 'planning-field-label-v0', ['Saldo inicial']),
        el('strong', '', [formatBRL(debt.openingBalance)]),
        el('small', '', ['O saldo não é editado diretamente. Ele muda pelos pagamentos registrados.'])
    ]);
    const form = el('form', 'planning-form-v0', [name.element, creditor.element, balanceInfo, hasOffer.element, offerGroup, error.element, submit]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        if (hasOffer.control.value === 'yes' && !offer.input.value.trim()) {
            submit.disabled = false;
            error.show('Informe o valor da oferta para quitar.');
            return;
        }
        void updateDebtDetails(context.repositories.debts, context.lifecycle, {
            profileId: context.profile.id,
            debtId: debt.id,
            name: name.input.value,
            ...(creditor.input.value.trim() ? { creditor: creditor.input.value.trim() } : {}),
            ...(hasOffer.control.value === 'yes' ? { settlementOffer: offer.input.value } : {}),
            ...(hasOffer.control.value === 'yes' && expiry.input.value ? { offerExpiry: expiry.input.value } : {})
        }).then(() => actions.onSaved(debt.id))
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar as alterações.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
export async function renderDebtPaymentV0(context, debtId, actions) {
    const [position, accounts] = await Promise.all([
        getFinancialPosition(context.repositories, context.profile.id),
        activeAccounts(context)
    ]);
    const item = position.debts.find((entry) => entry.debt.id === debtId);
    if (!item)
        throw new TypeError('Dívida não encontrada.');
    if (accounts.length === 0)
        throw new TypeError('Cadastre uma conta antes de registrar o pagamento.');
    const amount = planningMoneyFieldV0('Valor pago');
    amount.input.placeholder = centsToInput(item.position.outstanding);
    const account = planningChoiceFieldV0('Conta usada no pagamento', accountOptions(accounts), '');
    const date = planningInputFieldV0('Data', 'date', todayISO());
    const error = planningErrorV0();
    const submit = planningSubmitV0('Registrar pagamento');
    const form = el('form', 'planning-form-v0', [
        el('p', 'planning-form-support-v0', [`Saldo restante: ${formatBRL(item.position.outstanding)}.`]),
        amount.element, account.element, date.element, error.element, submit
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        submit.disabled = true;
        if (!account.control.value) {
            submit.disabled = false;
            error.show('Selecione a conta usada no pagamento.');
            return;
        }
        void payDebt(context.repositories.transactions, context.repositories.debts, context.repositories.accounts, {
            profileId: context.profile.id,
            debtId: item.debt.id,
            accountId: account.control.value,
            amount: amount.input.value,
            date: date.input.value
        }).then(() => { showToast('Pagamento registrado.', 'success'); actions.onCompleted(); })
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível registrar o pagamento.'); });
    });
    return el('div', 'planning-screen-v0 planning-form-screen-v0', [form]);
}
