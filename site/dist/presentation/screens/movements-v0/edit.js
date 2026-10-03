import { updateManualTransaction, isEditableManualTransaction } from '../../../application/transactions/update-manual-transaction.js';
import { el } from '../../dom.js';
import { moneyInputFieldV0, nativeInputFieldV0, choiceFieldV0 } from './controls.js';
const EXPENSE_CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Assinaturas', 'Lazer', 'Educação', 'Outros'];
const INCOME_CATEGORIES = ['Salário', 'Benefício', 'Rendimento', 'Venda', 'Reembolso', 'Outros'];
const PAYMENT_METHODS = [
    { value: 'pix', label: 'Pix' },
    { value: 'debit', label: 'Débito' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit-rail', label: 'Crédito em saldo/benefício' },
    { value: 'credit-card', label: 'Cartão de crédito' },
    { value: 'other', label: 'Outro' }
];
function centsToInput(value) {
    return (value / 100).toFixed(2).replace('.', ',');
}
export async function renderEditMovementV0(repositories, profile, mutations, transactionId, actions) {
    const transaction = await repositories.transactions.getById(transactionId);
    if (!transaction || transaction.profileId !== profile.id || !isEditableManualTransaction(transaction)) {
        const root = el('div', 'movement-internal-screen-v0 movement-not-found-v0', [
            el('strong', '', ['Esta movimentação não pode ser editada por este fluxo.'])
        ]);
        queueMicrotask(actions.onUnavailable);
        return root;
    }
    const [accountsRaw, cardsRaw] = await Promise.all([
        repositories.accounts.listByProfile(profile.id),
        repositories.creditCards.listByProfile(profile.id)
    ]);
    const accounts = accountsRaw.filter((item) => item.active);
    const cards = cardsRaw.filter((item) => item.active);
    const root = el('div', 'movement-internal-screen-v0 movement-edit-screen-v0');
    const form = el('form', 'movement-form-v0');
    const amount = moneyInputFieldV0('Valor', centsToInput(transaction.amount));
    const description = nativeInputFieldV0('Descrição', 'text', transaction.description ?? '');
    const date = nativeInputFieldV0('Data', 'date', transaction.date);
    const dynamic = el('div', 'movement-dynamic-fields-v0');
    const error = el('div', 'movement-form-error-v0');
    error.hidden = true;
    const save = el('button', 'movement-button-primary-v0', ['Salvar alterações']);
    save.type = 'submit';
    form.append(amount.element, description.element, date.element, dynamic, error, save);
    root.append(form);
    let work = async () => undefined;
    const common = () => {
        if (!amount.input.value.trim())
            throw new TypeError('Informe o valor.');
        if (!date.input.value)
            throw new TypeError('Informe a data.');
        return { amount: amount.input.value, description: description.input.value, date: date.input.value };
    };
    if (transaction.kind === 'transfer') {
        const origin = choiceFieldV0('Origem', accounts.map((item) => ({ value: item.id, label: item.name })), transaction.fromAccountId);
        const destination = choiceFieldV0('Destino', accounts.map((item) => ({ value: item.id, label: item.name })), transaction.toAccountId);
        dynamic.append(origin.element, destination.element);
        work = async () => {
            const values = common();
            if (!origin.control.value || !destination.control.value)
                throw new TypeError('Selecione origem e destino.');
            await updateManualTransaction(repositories.transactions, repositories.accounts, repositories.creditCards, mutations, {
                kind: 'transfer',
                profileId: profile.id,
                transactionId: transaction.id,
                amount: values.amount,
                date: values.date,
                description: values.description,
                fromAccountId: origin.control.value,
                toAccountId: destination.control.value
            });
        };
    }
    else if (transaction.kind === 'income' || transaction.kind === 'yield') {
        const account = choiceFieldV0('Conta', accounts.map((item) => ({ value: item.id, label: item.name })), transaction.accountId);
        const category = choiceFieldV0('Categoria', INCOME_CATEGORIES.map((value) => ({ value, label: value })), transaction.categoryId ?? (transaction.kind === 'yield' ? 'Rendimento' : 'Outros'));
        dynamic.append(account.element, category.element);
        work = async () => {
            const values = common();
            if (!account.control.value)
                throw new TypeError('Selecione a conta.');
            if (!category.control.value)
                throw new TypeError('Selecione a categoria.');
            await updateManualTransaction(repositories.transactions, repositories.accounts, repositories.creditCards, mutations, {
                kind: category.control.value === 'Rendimento' ? 'yield' : 'income',
                profileId: profile.id,
                transactionId: transaction.id,
                amount: values.amount,
                date: values.date,
                description: values.description,
                categoryId: category.control.value,
                accountId: account.control.value
            });
        };
    }
    else if (transaction.kind === 'expense') {
        const paymentValue = transaction.settlement.kind === 'credit-card' ? 'credit-card' : transaction.settlement.method;
        const payment = choiceFieldV0('Meio de pagamento', PAYMENT_METHODS, paymentValue);
        const category = choiceFieldV0('Categoria', EXPENSE_CATEGORIES.map((value) => ({ value, label: value })), transaction.categoryId ?? 'Outros');
        const settlementHost = el('div', 'movement-dynamic-fields-v0');
        let settlementSelect = null;
        const syncSettlement = () => {
            settlementHost.replaceChildren();
            if (payment.control.value === 'credit-card') {
                const current = transaction.settlement.kind === 'credit-card' ? transaction.settlement.creditCardId : '';
                const card = choiceFieldV0('Cartão', cards.map((item) => ({ value: item.id, label: item.name })), current, cards.length > 0 ? 'Selecione' : 'Nenhum cartão disponível');
                card.control.disabled = cards.length === 0;
                settlementSelect = card.control;
                settlementHost.append(card.element);
            }
            else {
                const current = transaction.settlement.kind === 'account' ? transaction.settlement.accountId : '';
                const account = choiceFieldV0('Conta', accounts.map((item) => ({ value: item.id, label: item.name })), current, accounts.length > 0 ? 'Selecione' : 'Nenhuma conta disponível');
                account.control.disabled = accounts.length === 0;
                settlementSelect = account.control;
                settlementHost.append(account.element);
            }
        };
        payment.control.addEventListener('change', syncSettlement);
        syncSettlement();
        dynamic.append(payment.element, settlementHost, category.element);
        work = async () => {
            const values = common();
            const paymentChoice = payment.control.value;
            if (!category.control.value)
                throw new TypeError('Selecione a categoria.');
            if (!settlementSelect?.value)
                throw new TypeError(paymentChoice === 'credit-card' ? 'Selecione o cartão.' : 'Selecione a conta.');
            if (paymentChoice === 'credit-card') {
                await updateManualTransaction(repositories.transactions, repositories.accounts, repositories.creditCards, mutations, {
                    kind: 'expense-card',
                    profileId: profile.id,
                    transactionId: transaction.id,
                    amount: values.amount,
                    date: values.date,
                    description: values.description,
                    categoryId: category.control.value,
                    creditCardId: settlementSelect.value
                });
            }
            else {
                await updateManualTransaction(repositories.transactions, repositories.accounts, repositories.creditCards, mutations, {
                    kind: 'expense-account',
                    profileId: profile.id,
                    transactionId: transaction.id,
                    amount: values.amount,
                    date: values.date,
                    description: values.description,
                    categoryId: category.control.value,
                    accountId: settlementSelect.value,
                    paymentMethod: paymentChoice
                });
            }
        };
    }
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.hidden = true;
        save.disabled = true;
        void work()
            .then(actions.onSaved)
            .catch((failure) => {
            save.disabled = false;
            error.textContent = failure instanceof Error ? failure.message : 'Não foi possível salvar as alterações.';
            error.hidden = false;
        });
    });
    return root;
}
