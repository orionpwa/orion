import { createAccount } from '../application/accounts/create-account.js';
import { updateAccountDetails } from '../application/accounts/update-account.js';
import { getDashboardSnapshot } from '../application/dashboard/get-dashboard.js';
import { listInstitutions, getInstitution } from '../catalog/institutions.js';
import { ACCOUNT_TYPE_OPTIONS } from '../catalog/account-types.js';
import { formatBRL } from '../domain/money/money.js';
import { el } from './dom.js';
import { labeledField, moneyField, selectorField, textField } from './components/fields.js';
import { showSheet } from './components/sheets.js';
import { showToast } from './components/feedback.js';
import { confirmEntityDeactivation, showEntityActions } from './components/entity-actions.js';
import { institutionLogo, V3_VISIBLE_INSTITUTIONS } from './institutions.js';
export async function renderAccountsV3(repositories, profile, lifecycle, onChanged) {
    const snapshot = await getDashboardSnapshot(repositories, profile.id);
    const root = el('div', 'screen-v3 accounts-screen-v3');
    const summary = el('section', 'accounts-summary-v3', [el('div', '', [el('small', '', ['SALDO DISPONÍVEL']), el('strong', '', [formatBRL(snapshot.availableNow)])]), el('div', '', [el('small', '', ['CONTAS ATIVAS']), el('strong', '', [String(snapshot.accounts.length)])])]);
    const add = el('button', 'account-add-v3', ['+ Adicionar conta']);
    add.type = 'button';
    add.addEventListener('click', () => openCreateAccountSheetV3(repositories, profile, onChanged));
    root.append(summary, add);
    if (snapshot.accounts.length === 0) {
        root.append(el('div', 'quick-empty-v3', [el('strong', '', ['Adicione sua primeira conta']), el('span', '', ['O Orion registra somente o que você informar.'])]));
        return root;
    }
    const list = el('section', 'accounts-list-v3');
    for (const account of snapshot.accounts) {
        list.append(accountRow(account, snapshot.balances.get(account.id) ?? account.openingBalance, repositories, profile, lifecycle, onChanged));
    }
    root.append(list);
    return root;
}
function accountRow(account, balance, repositories, profile, lifecycle, onChanged) {
    const institution = getInstitution(account.institutionId);
    const row = el('button', 'account-row-v3', [institutionLogo(account.institutionId, institution?.shortName ?? account.name, 'institution-logo-v3 account-logo-v3'), el('div', 'account-copy-v3', [el('strong', '', [account.name]), el('small', '', [account.type === 'benefit' ? 'Benefício' : account.type === 'payment' ? 'Conta de pagamento' : account.type === 'checking' ? 'Conta corrente' : institution?.name ?? 'Conta'])]), el('strong', 'account-balance-v3', [formatBRL(balance)]), el('span', 'row-chevron-v3', ['›'])]);
    row.type = 'button';
    row.addEventListener('click', () => showEntityActions(account.name, () => openEditAccountSheetV3(repositories, profile, lifecycle, account, onChanged), () => confirmEntityDeactivation(lifecycle, profile.id, 'account', account.id, 'Conta', onChanged)));
    return row;
}
function availableInstitutions() { return listInstitutions().filter(i => V3_VISIBLE_INSTITUTIONS.includes(i.id)); }
function openCreateAccountSheetV3(repositories, profile, onChanged) {
    const institutions = availableInstitutions();
    const institution = selectorField('Instituição', institutions.map(i => ({ value: i.id, label: i.name })), 'inter');
    const type = selectorField('Tipo de conta', ACCOUNT_TYPE_OPTIONS, 'checking');
    const name = textField('Nome da conta');
    const balance = moneyField('Saldo inicial');
    let last = '';
    institution.element.addEventListener('selectorchange', () => { const selected = getInstitution(institution.getValue() ?? undefined); const current = name.value.trim(); if (selected && (!current || current === last)) {
        name.value = selected.name;
        last = selected.name;
    } });
    const form = el('form', 'form-stack', [institution.element, type.element, labeledField('Nome', name), labeledField('Saldo inicial', balance)]);
    const save = el('button', 'btn primary full-width', ['Salvar conta']);
    save.type = 'submit';
    form.append(save);
    const close = showSheet('Nova conta', form);
    form.addEventListener('submit', e => { e.preventDefault(); const institutionId = institution.getValue(), accountType = type.getValue(); if (!institutionId || !accountType) {
        showToast('Selecione instituição e tipo de conta.', 'error');
        return;
    } save.disabled = true; const data = getInstitution(institutionId); void createAccount(repositories.accounts, { profileId: profile.id, institutionId, type: accountType, name: name.value, openingBalance: balance.value || '0', color: data?.color ?? '#58708f' }).then(() => { close(); showToast('Conta criada.', 'success'); onChanged(); }).catch((error) => { save.disabled = false; showToast(error instanceof Error ? error.message : 'Não foi possível criar a conta.', 'error'); }); });
}
function openEditAccountSheetV3(repositories, profile, lifecycle, account, onChanged) {
    const institutions = availableInstitutions();
    if (!institutions.some(i => i.id === account.institutionId)) {
        const custom = getInstitution('custom');
        if (custom && !institutions.some(i => i.id === 'custom'))
            institutions.push(custom);
    }
    const institution = selectorField('Instituição', institutions.map(i => ({ value: i.id, label: i.name })), account.institutionId ?? 'custom');
    const type = selectorField('Tipo de conta', ACCOUNT_TYPE_OPTIONS, account.type ?? 'other');
    const availability = selectorField('Disponibilidade', [{ value: 'yes', label: 'Disponível para uso' }, { value: 'no', label: 'Não disponível' }], account.includeInAvailable === false ? 'no' : 'yes');
    const name = textField('Nome da conta', account.name);
    const form = el('form', 'form-stack', [institution.element, type.element, availability.element, labeledField('Nome', name), el('div', 'inline-warning', ['O saldo inicial permanece preservado. Ajustes de saldo devem ser registrados como movimentação.'])]);
    const save = el('button', 'btn primary full-width', ['Salvar alterações']);
    save.type = 'submit';
    form.append(save);
    const close = showSheet('Editar conta', form);
    form.addEventListener('submit', e => { e.preventDefault(); const institutionId = institution.getValue(), accountType = type.getValue(), available = availability.getValue(); if (!institutionId || !accountType || !available) {
        showToast('Revise os campos da conta.', 'error');
        return;
    } save.disabled = true; void updateAccountDetails(repositories.accounts, lifecycle, { profileId: profile.id, accountId: account.id, name: name.value, institutionId, type: accountType, ...(getInstitution(institutionId)?.color ?? account.color ? { color: getInstitution(institutionId)?.color ?? account.color } : {}), includeInAvailable: available === 'yes' }).then(() => { close(); showToast('Conta atualizada.', 'success'); onChanged(); }).catch((error) => { save.disabled = false; showToast(error instanceof Error ? error.message : 'Não foi possível atualizar a conta.', 'error'); }); });
}
