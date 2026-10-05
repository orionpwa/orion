import { createCreditCard } from '../../../application/credit-cards/create-credit-card.js';
import { updateCreditCardDetails } from '../../../application/credit-cards/update-credit-card.js';
import { payCreditCard } from '../../../application/credit-cards/pay-credit-card.js';
import { calculateCreditCardPosition } from '../../../domain/credit-cards/invoice.js';
import { formatBRL, maxCents, subtractCents, ZERO_CENTS } from '../../../domain/money/money.js';
import { getInstitution, listInstitutions } from '../../../catalog/institutions.js';
import { el } from '../../dom.js';
import { institutionLogo, VISIBLE_INSTITUTIONS_V0 } from '../../institutions.js';
import { showToast } from '../../components/feedback.js';
import { deactivateWithUndoFeedback } from '../../components/lifecycle-feedback.js';
import { accountChoiceFieldV0, accountErrorV0, accountInputFieldV0, accountMoneyFieldV0 } from './controls.js';
function availableInstitutions() {
    return listInstitutions().filter((item) => VISIBLE_INSTITUTIONS_V0.includes(item.id));
}
function centsToInput(value) {
    return (value / 100).toFixed(2).replace('.', ',');
}
function todayISO(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function nativeField(label, type, value = '') {
    const input = document.createElement('input');
    input.className = 'account-field-control-v0';
    input.type = type;
    input.value = value;
    input.setAttribute('aria-label', label);
    if (type === 'number') {
        input.min = '1';
        input.max = '31';
        input.inputMode = 'numeric';
    }
    return { input, element: el('label', 'account-field-v0', [el('span', 'account-field-label-v0', [label]), input]) };
}
function detailRow(label, value) {
    return el('div', 'account-detail-row-v0', [el('dt', '', [label]), el('dd', '', [value])]);
}
function cardInstitutionLabel(institutionId) {
    return getInstitution(institutionId)?.name ?? 'Outra instituição';
}
function cardHistory(transactions, cardId) {
    return [...transactions]
        .filter((transaction) => ((transaction.kind === 'expense' && transaction.settlement.kind === 'credit-card' && transaction.settlement.creditCardId === cardId)
        || (transaction.kind === 'credit-card-payment' && transaction.creditCardId === cardId)))
        .sort((left, right) => right.date.localeCompare(left.date) || (right.createdAt ?? right.id).localeCompare(left.createdAt ?? left.id));
}
function historyLabel(transaction) {
    return transaction.kind === 'credit-card-payment' ? 'Pagamento de fatura' : (transaction.description ?? 'Compra no cartão');
}
function historyTone(transaction) {
    return transaction.kind === 'credit-card-payment' ? 'positive' : 'negative';
}
function formatDateBR(value) {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}
async function activeAccounts(context) {
    return (await context.repositories.accounts.listByProfile(context.profile.id)).filter((item) => item.active);
}
export async function renderCardListV1(context, actions) {
    const [cardsRaw, transactions] = await Promise.all([
        context.repositories.creditCards.listByProfile(context.profile.id),
        context.repositories.transactions.listByProfile(context.profile.id)
    ]);
    const cards = cardsRaw.filter((item) => item.active);
    const root = el('section', 'accounts-card-section-v1');
    root.append(el('div', 'accounts-section-title-v1', [el('h2', '', ['Cartões de crédito'])]));
    const create = el('button', 'accounts-inline-primary-v0', ['Adicionar cartão']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    root.append(create);
    if (cards.length === 0) {
        root.append(el('div', 'accounts-empty-compact-v1', ['Nenhum cartão cadastrado.']));
        return root;
    }
    const list = el('div', 'accounts-list-v0');
    for (const card of cards) {
        const institution = getInstitution(card.institutionId);
        const position = calculateCreditCardPosition(card, transactions);
        const row = el('button', 'account-row-v0', [
            institutionLogo(card.institutionId, institution?.shortName ?? card.name, 'account-logo-v0'),
            el('span', 'account-row-copy-v0', [el('strong', '', [card.name]), el('small', '', ['Fatura aberta'])]),
            el('strong', 'account-row-balance-v0', [formatBRL(position.openLiability)]),
            el('span', 'account-row-chevron-v0', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(card.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
export function renderNewCardV1(context, actions) {
    const institutions = availableInstitutions();
    const institution = accountChoiceFieldV0('Instituição', institutions.map((item) => ({ value: item.id, label: item.name })), '', 'Selecione');
    const name = accountInputFieldV0('Nome do cartão');
    const limit = accountMoneyFieldV0('Limite de crédito');
    const opening = accountMoneyFieldV0('Fatura em aberto agora');
    const closing = nativeField('Dia de fechamento', 'number');
    const due = nativeField('Dia de vencimento', 'number');
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar cartão']);
    save.type = 'submit';
    const form = el('form', 'account-form-v0', [
        institution.element, name.element, limit.element, opening.element, closing.element, due.element,
        el('p', 'accounts-form-support-v1', ['A conta usada para pagar a fatura pode ser definida depois. Compras continuam sendo registradas em Movimentos.']),
        error.element, save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        const institutionId = institution.control.value;
        if (!institutionId) {
            save.disabled = false;
            error.show('Selecione a instituição.');
            return;
        }
        void createCreditCard(context.repositories.creditCards, context.repositories.accounts, context.repositories.assets, {
            profileId: context.profile.id,
            name: name.input.value,
            institutionId,
            ...(limit.input.value.trim() ? { creditLimit: limit.input.value } : {}),
            ...(opening.input.value.trim() ? { openingLiability: opening.input.value } : {}),
            ...(closing.input.value ? { closingDay: Number(closing.input.value) } : {}),
            ...(due.input.value ? { dueDay: Number(due.input.value) } : {})
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => { save.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível criar o cartão.'); });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
export async function renderCardDetailV1(context, cardId, actions) {
    const [card, transactions, accounts] = await Promise.all([
        context.repositories.creditCards.getById(cardId),
        context.repositories.transactions.listByProfile(context.profile.id),
        context.repositories.accounts.listByProfile(context.profile.id)
    ]);
    if (!card || card.profileId !== context.profile.id || !card.active)
        throw new TypeError('Cartão não encontrado.');
    const position = calculateCreditCardPosition(card, transactions);
    const history = cardHistory(transactions, card.id).slice(0, 8);
    const paymentAccount = card.paymentAccountId ? accounts.find((item) => item.id === card.paymentAccountId) : undefined;
    const availableLimit = card.creditLimit !== undefined ? maxCents(subtractCents(card.creditLimit, position.openLiability), ZERO_CENTS) : undefined;
    const root = el('div', 'account-internal-screen-v0 account-detail-screen-v0');
    root.append(el('section', 'account-detail-hero-v0', [
        el('small', '', ['FATURA EM ABERTO']),
        el('strong', '', [formatBRL(position.openLiability)]),
        el('span', '', [card.name])
    ]));
    root.append(el('dl', 'account-detail-list-v0', [
        detailRow('Instituição', cardInstitutionLabel(card.institutionId)),
        ...(card.creditLimit !== undefined ? [detailRow('Limite', formatBRL(card.creditLimit))] : []),
        ...(availableLimit !== undefined ? [detailRow('Limite disponível', formatBRL(availableLimit))] : []),
        detailRow('Fechamento', card.closingDay ? `Dia ${card.closingDay}` : 'Não informado'),
        detailRow('Vencimento', card.dueDay ? `Dia ${card.dueDay}` : 'Não informado'),
        detailRow('Conta para pagamento', paymentAccount?.name ?? 'Não definida'),
        detailRow('Fatura inicial', formatBRL(card.openingLiability))
    ]));
    const actionStack = el('section', 'account-action-stack-v0');
    if (position.openLiability > ZERO_CENTS) {
        const pay = el('button', 'account-primary-action-v0', ['Registrar pagamento']);
        pay.type = 'button';
        pay.addEventListener('click', actions.onPayment);
        actionStack.append(pay);
    }
    const edit = el('button', 'account-secondary-action-v0', ['Editar cartão']);
    edit.type = 'button';
    edit.addEventListener('click', actions.onEdit);
    actionStack.append(edit);
    root.append(actionStack, el('div', 'account-section-heading-v0', [el('h2', '', ['Compras e pagamentos'])]));
    if (history.length === 0)
        root.append(el('div', 'accounts-empty-v0', ['Nenhuma compra ou pagamento registrado neste cartão.']));
    else {
        const list = el('div', 'account-movement-list-v0');
        for (const transaction of history) {
            list.append(el('div', 'account-movement-row-v0', [
                el('span', '', [el('strong', '', [historyLabel(transaction)]), el('small', '', [formatDateBR(transaction.date)])]),
                el('strong', `account-movement-value-v0 ${historyTone(transaction)}`, [formatBRL(transaction.amount)])
            ]));
        }
        root.append(list);
    }
    const deactivate = el('button', 'account-danger-action-v0', ['Desativar cartão']);
    deactivate.type = 'button';
    const confirm = el('div', 'account-confirm-v0');
    confirm.hidden = true;
    const cancel = el('button', 'account-secondary-action-v0', ['Cancelar']);
    cancel.type = 'button';
    const confirmButton = el('button', 'account-danger-confirm-v0', ['Desativar']);
    confirmButton.type = 'button';
    confirm.append(el('p', '', ['Compras e pagamentos existentes serão preservados. O cartão deixará de aparecer entre os cartões ativos.']), el('div', 'account-confirm-actions-v0', [cancel, confirmButton]));
    deactivate.addEventListener('click', () => { deactivate.hidden = true; confirm.hidden = false; });
    cancel.addEventListener('click', () => { confirm.hidden = true; deactivate.hidden = false; });
    confirmButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        deactivateWithUndoFeedback(context.lifecycle, context.profile.id, 'credit-card', card.id, 'Cartão', actions.onDeactivated);
    });
    root.append(el('section', 'account-danger-zone-v0', [deactivate, confirm]));
    return root;
}
export async function renderEditCardV1(context, cardId, actions) {
    const [card, accounts] = await Promise.all([context.repositories.creditCards.getById(cardId), activeAccounts(context)]);
    if (!card || card.profileId !== context.profile.id || !card.active)
        throw new TypeError('Cartão não encontrado.');
    const institutions = [...availableInstitutions()];
    if (card.institutionId && !institutions.some((item) => item.id === card.institutionId)) {
        const custom = getInstitution('custom');
        if (custom)
            institutions.push(custom);
    }
    const institution = accountChoiceFieldV0('Instituição', institutions.map((item) => ({ value: item.id, label: item.name })), card.institutionId ?? 'custom');
    const name = accountInputFieldV0('Nome do cartão', card.name);
    const payment = accountChoiceFieldV0('Conta para pagamento', [
        { value: '', label: 'Nenhuma conta definida' },
        ...accounts.map((item) => ({ value: item.id, label: item.name }))
    ], card.paymentAccountId ?? '');
    const limit = accountMoneyFieldV0('Limite de crédito', card.creditLimit !== undefined ? centsToInput(card.creditLimit) : '');
    const closing = nativeField('Dia de fechamento', 'number', card.closingDay ? String(card.closingDay) : '');
    const due = nativeField('Dia de vencimento', 'number', card.dueDay ? String(card.dueDay) : '');
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar alterações']);
    save.type = 'submit';
    const opening = el('div', 'account-static-field-v0', [
        el('span', 'account-field-label-v0', ['Fatura inicial']),
        el('strong', '', [formatBRL(card.openingLiability)]),
        el('small', '', ['A fatura inicial permanece preservada. A fatura atual muda com compras e pagamentos.'])
    ]);
    const form = el('form', 'account-form-v0', [institution.element, name.element, payment.element, limit.element, closing.element, due.element, opening, error.element, save]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        void updateCreditCardDetails(context.repositories.creditCards, context.repositories.accounts, context.repositories.assets, context.lifecycle, {
            profileId: context.profile.id,
            cardId: card.id,
            name: name.input.value,
            institutionId: institution.control.value,
            ...(payment.control.value ? { paymentAccountId: payment.control.value } : {}),
            ...(limit.input.value.trim() ? { creditLimit: limit.input.value } : {}),
            ...(closing.input.value ? { closingDay: Number(closing.input.value) } : {}),
            ...(due.input.value ? { dueDay: Number(due.input.value) } : {})
        }).then(() => actions.onSaved(card.id))
            .catch((failure) => { save.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar o cartão.'); });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
export async function renderCardPaymentV1(context, cardId, actions) {
    const [card, transactions, accounts] = await Promise.all([
        context.repositories.creditCards.getById(cardId),
        context.repositories.transactions.listByProfile(context.profile.id),
        activeAccounts(context)
    ]);
    if (!card || card.profileId !== context.profile.id || !card.active)
        throw new TypeError('Cartão não encontrado.');
    const position = calculateCreditCardPosition(card, transactions);
    if (position.openLiability <= ZERO_CENTS)
        throw new TypeError('Este cartão não possui fatura em aberto.');
    if (accounts.length === 0)
        throw new TypeError('Cadastre uma conta antes de registrar o pagamento da fatura.');
    const amount = accountMoneyFieldV0('Valor pago');
    amount.input.placeholder = centsToInput(position.openLiability);
    const account = accountChoiceFieldV0('Conta usada no pagamento', accounts.map((item) => ({
        value: item.id,
        label: item.name,
        ...(item.id === card.paymentAccountId ? { description: 'Conta definida para este cartão' } : {})
    })), '', 'Selecione');
    const date = nativeField('Data', 'date', todayISO());
    const error = accountErrorV0();
    const submit = el('button', 'account-primary-action-v0', ['Registrar pagamento']);
    submit.type = 'submit';
    const form = el('form', 'account-form-v0', [
        el('p', 'accounts-form-support-v1', [`Fatura em aberto: ${formatBRL(position.openLiability)}.`]),
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
        void payCreditCard(context.repositories.transactions, context.repositories.creditCards, context.repositories.accounts, context.repositories.assets, {
            profileId: context.profile.id,
            creditCardId: card.id,
            amount: amount.input.value,
            date: date.input.value,
            source: { kind: 'account', accountId: account.control.value }
        }).then(() => { showToast('Pagamento de fatura registrado.', 'success'); actions.onCompleted(); })
            .catch((failure) => { submit.disabled = false; error.show(failure instanceof Error ? failure.message : 'Não foi possível registrar o pagamento.'); });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
