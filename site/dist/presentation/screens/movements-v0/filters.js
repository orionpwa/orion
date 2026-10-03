import { el } from '../../dom.js';
import { nativeInputFieldV0, choiceFieldV0 } from './controls.js';
import { DEFAULT_MOVEMENT_FILTERS_V0 } from './shared.js';
const PERIOD_OPTIONS = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: 'month', label: 'Este mês' },
    { value: 'custom', label: 'Período personalizado' }
];
const NATURE_OPTIONS = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'income', label: 'Receitas' },
    { value: 'expense', label: 'Despesas' },
    { value: 'transfer', label: 'Transferências' },
    { value: 'payment', label: 'Pagamentos' },
    { value: 'patrimonial', label: 'Patrimoniais' }
];
export async function renderMovementFiltersV0(repositories, profile, current, actions) {
    const [accounts, transactions] = await Promise.all([
        repositories.accounts.listByProfile(profile.id),
        repositories.transactions.listByProfile(profile.id)
    ]);
    const categories = Array.from(new Set(transactions.flatMap((transaction) => ('categoryId' in transaction && transaction.categoryId ? [transaction.categoryId] : [])))).sort((left, right) => left.localeCompare(right, 'pt-BR'));
    const root = el('div', 'movement-internal-screen-v0 movement-filters-screen-v0');
    const form = el('form', 'movement-form-v0');
    const period = choiceFieldV0('Período', PERIOD_OPTIONS, current.period);
    const nature = choiceFieldV0('Tipo', NATURE_OPTIONS, current.nature);
    const account = choiceFieldV0('Conta', [
        { value: '', label: 'Todas as contas' },
        ...accounts.map((item) => ({ value: item.id, label: item.name }))
    ], current.accountId);
    const category = choiceFieldV0('Categoria', [
        { value: '', label: 'Todas as categorias' },
        ...categories.map((item) => ({ value: item, label: item }))
    ], current.category);
    const customDates = el('div', 'movement-custom-dates-v0');
    const start = nativeInputFieldV0('De', 'date', current.startDate);
    const end = nativeInputFieldV0('Até', 'date', current.endDate);
    customDates.append(start.element, end.element);
    const syncCustomDates = () => {
        customDates.hidden = period.control.value !== 'custom';
    };
    period.control.addEventListener('change', syncCustomDates);
    syncCustomDates();
    const actionsRow = el('div', 'movement-form-actions-v0');
    const clear = el('button', 'movement-button-secondary-v0', ['Limpar']);
    clear.type = 'button';
    clear.addEventListener('click', () => {
        period.setValue(DEFAULT_MOVEMENT_FILTERS_V0.period);
        nature.setValue(DEFAULT_MOVEMENT_FILTERS_V0.nature);
        account.setValue('');
        category.setValue('');
        start.input.value = '';
        end.input.value = '';
        syncCustomDates();
    });
    const apply = el('button', 'movement-button-primary-v0', ['Aplicar filtros']);
    apply.type = 'submit';
    actionsRow.append(clear, apply);
    form.append(period.element, customDates, nature.element, account.element, category.element, actionsRow);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const next = {
            period: period.control.value,
            nature: nature.control.value,
            accountId: account.control.value,
            category: category.control.value,
            startDate: start.input.value,
            endDate: end.input.value
        };
        actions.onApply(next);
    });
    root.append(form);
    return root;
}
