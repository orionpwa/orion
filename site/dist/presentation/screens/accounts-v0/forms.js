import { createAccount } from '../../../application/accounts/create-account.js';
import { updateAccountDetails } from '../../../application/accounts/update-account.js';
import { ACCOUNT_TYPE_OPTIONS } from '../../../catalog/account-types.js';
import { getInstitution, listInstitutions } from '../../../catalog/institutions.js';
import { el } from '../../dom.js';
import { VISIBLE_INSTITUTIONS_V0 } from '../../institutions.js';
import { accountChoiceFieldV0, accountErrorV0, accountInputFieldV0, accountMoneyFieldV0 } from './controls.js';
function availableInstitutions() {
    return listInstitutions().filter((item) => VISIBLE_INSTITUTIONS_V0.includes(item.id));
}
function isRestrictedBenefit(institutionId, type) {
    return institutionId === 'caju' || type === 'benefit';
}
export function renderNewAccountV0(context, actions) {
    const institutions = availableInstitutions();
    const institution = accountChoiceFieldV0('Instituição', institutions.map((item) => ({ value: item.id, label: item.name })), 'inter');
    const type = accountChoiceFieldV0('Tipo de conta', ACCOUNT_TYPE_OPTIONS, 'checking');
    const name = accountInputFieldV0('Nome da conta');
    const balance = accountMoneyFieldV0('Saldo inicial');
    let last = '';
    const syncInstitution = () => {
        const selected = getInstitution(institution.control.value);
        const current = name.input.value.trim();
        if (selected && (!current || current === last)) {
            name.input.value = selected.id === 'caju' ? 'Caju · VA' : selected.name;
            last = name.input.value;
        }
        if (selected?.id === 'caju')
            type.control.value = 'benefit';
    };
    institution.control.addEventListener('change', syncInstitution);
    syncInstitution();
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar conta']);
    save.type = 'submit';
    const form = el('form', 'account-form-v0', [institution.element, type.element, name.element, balance.element, error.element, save]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        const institutionId = institution.control.value;
        const accountType = type.control.value;
        if (!institutionId || !accountType) {
            error.show('Selecione instituição e tipo de conta.');
            return;
        }
        save.disabled = true;
        const catalogItem = getInstitution(institutionId);
        void createAccount(context.repositories.accounts, {
            profileId: context.profile.id,
            institutionId,
            type: accountType,
            name: name.input.value,
            openingBalance: balance.input.value || '0',
            color: catalogItem?.color ?? '#58708f'
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => {
            save.disabled = false;
            error.show(failure instanceof Error ? failure.message : 'Não foi possível criar a conta.');
        });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
export async function renderEditAccountV0(context, accountId, actions) {
    const account = await context.repositories.accounts.getById(accountId);
    if (!account || account.profileId !== context.profile.id || !account.active)
        throw new TypeError('Conta não encontrada.');
    const institutions = [...availableInstitutions()];
    if (!institutions.some((item) => item.id === account.institutionId)) {
        const custom = getInstitution('custom');
        if (custom && !institutions.some((item) => item.id === 'custom'))
            institutions.push(custom);
    }
    const institution = accountChoiceFieldV0('Instituição', institutions.map((item) => ({ value: item.id, label: item.name })), account.institutionId ?? 'custom');
    const type = accountChoiceFieldV0('Tipo de conta', ACCOUNT_TYPE_OPTIONS, account.type ?? 'other');
    const availability = accountChoiceFieldV0('Disponibilidade', [
        { value: 'yes', label: 'Disponível para uso' },
        { value: 'no', label: 'Não disponível / benefício restrito' }
    ], account.includeInAvailable === false ? 'no' : 'yes');
    const name = accountInputFieldV0('Nome da conta', account.name);
    const syncAvailability = () => {
        const restricted = isRestrictedBenefit(institution.control.value, type.control.value);
        if (restricted)
            availability.control.value = 'no';
        availability.control.disabled = restricted;
    };
    institution.control.addEventListener('change', () => {
        if (institution.control.value === 'caju')
            type.control.value = 'benefit';
        syncAvailability();
    });
    type.control.addEventListener('change', syncAvailability);
    syncAvailability();
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar alterações']);
    save.type = 'submit';
    const preservedBalance = el('div', 'account-static-field-v0', [
        el('span', 'account-field-label-v0', ['Saldo inicial']),
        el('strong', '', ['Preservado']),
        el('small', '', ['O saldo inicial permanece preservado. O saldo da conta muda por movimentações e não é ajustado diretamente aqui.'])
    ]);
    const form = el('form', 'account-form-v0', [institution.element, type.element, availability.element, name.element, preservedBalance, error.element, save]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        const institutionId = institution.control.value;
        const accountType = type.control.value;
        const available = availability.control.value;
        const catalogItem = getInstitution(institutionId);
        void updateAccountDetails(context.repositories.accounts, context.lifecycle, {
            profileId: context.profile.id,
            accountId: account.id,
            name: name.input.value,
            institutionId,
            type: accountType,
            ...((catalogItem?.color ?? account.color) ? { color: catalogItem?.color ?? account.color } : {}),
            includeInAvailable: available === 'yes'
        }).then(() => actions.onSaved(account.id))
            .catch((failure) => {
            save.disabled = false;
            error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar as alterações.');
        });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
