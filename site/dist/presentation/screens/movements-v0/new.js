import { createTransaction } from '../../../application/transactions/create-transaction.js';
import { recordCardPurchase } from '../../../application/credit-cards/record-card-purchase.js';
import { el } from '../../dom.js';
import { moneyInputFieldV0, nativeInputFieldV0, choiceFieldV0 } from './controls.js';
import { localIsoDate } from './shared.js';
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
export async function renderNewMovementV0(repositories, profile, actions) {
    const [accountsRaw, cardsRaw] = await Promise.all([
        repositories.accounts.listByProfile(profile.id),
        repositories.creditCards.listByProfile(profile.id)
    ]);
    const accounts = accountsRaw.filter((item) => item.active);
    const cards = cardsRaw.filter((item) => item.active);
    const root = el('div', 'movement-internal-screen-v0 movement-new-screen-v0');
    const kindPicker = el('div', 'movement-kind-picker-v0');
    const form = el('form', 'movement-form-v0');
    const amount = moneyInputFieldV0('Valor');
    const description = nativeInputFieldV0('Descrição', 'text');
    const date = nativeInputFieldV0('Data', 'date', localIsoDate());
    const dynamic = el('div', 'movement-dynamic-fields-v0');
    const error = el('div', 'movement-form-error-v0');
    error.hidden = true;
    const submit = el('button', 'movement-button-primary-v0', ['Salvar movimentação']);
    submit.type = 'submit';
    form.append(amount.element, description.element, date.element, dynamic, error, submit);
    root.append(kindPicker, form);
    let kind = 'expense';
    let readDynamic = async () => { throw new TypeError('Selecione o tipo da movimentação.'); };
    const showError = (message) => {
        error.textContent = message;
        error.hidden = false;
    };
    const requireCommon = () => {
        if (!amount.input.value.trim())
            throw new TypeError('Informe o valor.');
        if (!date.input.value)
            throw new TypeError('Informe a data.');
        return { amount: amount.input.value, description: description.input.value, date: date.input.value };
    };
    const renderDynamic = () => {
        dynamic.replaceChildren();
        error.hidden = true;
        if (kind === 'expense') {
            const payment = choiceFieldV0('Meio de pagamento', PAYMENT_METHODS, '', 'Selecione');
            const settlementHost = el('div', 'movement-dynamic-fields-v0');
            const category = choiceFieldV0('Categoria', EXPENSE_CATEGORIES.map((value) => ({ value, label: value })), '', 'Selecione');
            let settlementSelect = null;
            const syncSettlement = () => {
                settlementHost.replaceChildren();
                const value = payment.control.value;
                if (value === 'credit-card') {
                    const card = choiceFieldV0('Cartão', cards.map((item) => ({ value: item.id, label: item.name })), '', cards.length > 0 ? 'Selecione' : 'Nenhum cartão disponível');
                    card.control.disabled = cards.length === 0;
                    settlementSelect = card.control;
                    settlementHost.append(card.element);
                }
                else {
                    const account = choiceFieldV0('Conta', accounts.map((item) => ({ value: item.id, label: item.name })), '', accounts.length > 0 ? 'Selecione' : 'Nenhuma conta disponível');
                    account.control.disabled = accounts.length === 0;
                    settlementSelect = account.control;
                    settlementHost.append(account.element);
                }
            };
            payment.control.addEventListener('change', syncSettlement);
            syncSettlement();
            dynamic.append(payment.element, settlementHost, category.element);
            readDynamic = async () => {
                const common = requireCommon();
                const paymentChoice = payment.control.value;
                const categoryId = category.control.value;
                if (!paymentChoice)
                    throw new TypeError('Selecione o meio de pagamento.');
                if (!categoryId)
                    throw new TypeError('Selecione a categoria.');
                if (!settlementSelect?.value)
                    throw new TypeError(paymentChoice === 'credit-card' ? 'Selecione o cartão.' : 'Selecione a conta.');
                if (paymentChoice === 'credit-card') {
                    return recordCardPurchase(repositories.transactions, repositories.creditCards, repositories.accounts, {
                        profileId: profile.id,
                        creditCardId: settlementSelect.value,
                        amount: common.amount,
                        date: common.date,
                        description: common.description || categoryId,
                        categoryId
                    });
                }
                return createTransaction(repositories.transactions, repositories.accounts, {
                    kind: 'expense',
                    profileId: profile.id,
                    amount: common.amount,
                    date: common.date,
                    description: common.description || categoryId,
                    categoryId,
                    accountId: settlementSelect.value,
                    paymentMethod: paymentChoice
                });
            };
            return;
        }
        if (kind === 'income') {
            const account = choiceFieldV0('Conta de entrada', accounts.map((item) => ({ value: item.id, label: item.name })), '', accounts.length > 0 ? 'Selecione' : 'Nenhuma conta disponível');
            account.control.disabled = accounts.length === 0;
            const category = choiceFieldV0('Categoria', INCOME_CATEGORIES.map((value) => ({ value, label: value })), '', 'Selecione');
            dynamic.append(account.element, category.element);
            readDynamic = async () => {
                const common = requireCommon();
                if (!account.control.value)
                    throw new TypeError('Selecione a conta de entrada.');
                if (!category.control.value)
                    throw new TypeError('Selecione a categoria.');
                return createTransaction(repositories.transactions, repositories.accounts, {
                    kind: category.control.value === 'Rendimento' ? 'yield' : 'income',
                    profileId: profile.id,
                    amount: common.amount,
                    date: common.date,
                    description: common.description || category.control.value,
                    categoryId: category.control.value,
                    accountId: account.control.value
                });
            };
            return;
        }
        const origin = choiceFieldV0('Origem', accounts.map((item) => ({ value: item.id, label: item.name })), '', accounts.length > 0 ? 'Selecione' : 'Nenhuma conta disponível');
        const destination = choiceFieldV0('Destino', accounts.map((item) => ({ value: item.id, label: item.name })), '', accounts.length > 0 ? 'Selecione' : 'Nenhuma conta disponível');
        origin.control.disabled = accounts.length < 2;
        destination.control.disabled = accounts.length < 2;
        dynamic.append(origin.element, destination.element);
        readDynamic = async () => {
            const common = requireCommon();
            if (accounts.length < 2)
                throw new TypeError('Cadastre pelo menos duas contas para fazer uma transferência.');
            if (!origin.control.value || !destination.control.value)
                throw new TypeError('Selecione origem e destino.');
            return createTransaction(repositories.transactions, repositories.accounts, {
                kind: 'transfer',
                profileId: profile.id,
                amount: common.amount,
                date: common.date,
                description: common.description || 'Transferência',
                fromAccountId: origin.control.value,
                toAccountId: destination.control.value
            });
        };
    };
    const renderKindPicker = () => {
        kindPicker.replaceChildren();
        const options = [
            { value: 'expense', label: 'Despesa' },
            { value: 'income', label: 'Receita' },
            { value: 'transfer', label: 'Transferência' }
        ];
        for (const item of options) {
            const button = el('button', `movement-kind-button-v0${kind === item.value ? ' active' : ''}`, [item.label]);
            button.type = 'button';
            button.setAttribute('aria-pressed', String(kind === item.value));
            button.addEventListener('click', () => {
                kind = item.value;
                renderKindPicker();
                renderDynamic();
            });
            kindPicker.append(button);
        }
    };
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.hidden = true;
        submit.disabled = true;
        void readDynamic()
            .then(actions.onSaved)
            .catch((failure) => {
            submit.disabled = false;
            showError(failure instanceof Error ? failure.message : 'Não foi possível salvar a movimentação.');
        });
    });
    renderKindPicker();
    renderDynamic();
    return root;
}
