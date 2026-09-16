import { createAccount } from '../../application/accounts/create-account.js';
import { updateAccountDetails } from '../../application/accounts/update-account.js';
import { getDashboardSnapshot } from '../../application/dashboard/get-dashboard.js';
import { listInstitutions, getInstitution } from '../../catalog/institutions.js';
import { ACCOUNT_TYPE_OPTIONS } from '../../catalog/account-types.js';
import { formatBRL } from '../../domain/money/money.js';
import { el } from '../dom.js';
import { labeledField, moneyField, selectorField, textField } from '../components/fields.js';
import { showSheet } from '../components/sheets.js';
import { showToast } from '../components/feedback.js';
import { confirmEntityDeactivation, showEntityActions } from '../components/entity-actions.js';
import { institutionBrand } from './institution-brand.js';
function accountRow(account, balance, repositories, profile, lifecycle, onChanged, refreshManager) {
    const institution = getInstitution(account.institutionId);
    const row = el('button', 'account-manager-row-v2', [
        institutionBrand(account.institutionId, account.name, 'institution-brand-v2 account-manager-brand-v2'),
        el('div', 'account-manager-copy-v2', [
            el('strong', '', [account.name]),
            el('small', '', [institution?.name ?? 'Outra instituição'])
        ]),
        el('strong', 'account-manager-balance-v2', [formatBRL(balance)]),
        el('span', 'account-manager-chevron-v2', ['›'])
    ]);
    row.type = 'button';
    row.addEventListener('click', () => showEntityActions(account.name, () => openEditAccountSheet(repositories, profile, lifecycle, account, () => { onChanged(); refreshManager(); }), () => confirmEntityDeactivation(lifecycle, profile.id, 'account', account.id, 'Conta', () => { onChanged(); refreshManager(); })));
    return row;
}
export function openAccountsManager(repositories, profile, lifecycle, onChanged) {
    const host = el('div', 'accounts-manager-v2');
    let close = () => undefined;
    const render = async () => {
        const snapshot = await getDashboardSnapshot(repositories, profile.id);
        host.replaceChildren();
        const top = el('div', 'accounts-manager-head-v2', [
            el('div', '', [
                el('strong', '', ['Suas contas']),
                el('small', '', [`${snapshot.accounts.length} ${snapshot.accounts.length === 1 ? 'conta ativa' : 'contas ativas'}`])
            ])
        ]);
        host.append(top);
        if (snapshot.accounts.length === 0) {
            host.append(el('div', 'empty-card', [
                el('strong', '', ['Sua base financeira começa aqui']),
                el('span', '', ['Adicione onde seu dinheiro está para o Orion organizar seus saldos.'])
            ]));
        }
        else {
            const list = el('div', 'accounts-manager-list-v2');
            for (const account of snapshot.accounts) {
                list.append(accountRow(account, snapshot.balances.get(account.id) ?? account.openingBalance, repositories, profile, lifecycle, onChanged, () => void render()));
            }
            host.append(list);
        }
        const add = el('button', 'btn primary full-width accounts-manager-add-v2', ['+ Adicionar conta']);
        add.type = 'button';
        add.addEventListener('click', () => openCreateAccountSheet(repositories, profile, () => { onChanged(); void render(); }));
        host.append(add);
    };
    close = showSheet('Contas', host);
    void render().catch((error) => {
        showToast(error instanceof Error ? error.message : 'Não foi possível abrir suas contas.', 'error');
        close();
    });
}
function openCreateAccountSheet(repositories, profile, onChanged) {
    const institutions = listInstitutions();
    const institution = selectorField('Instituição', institutions.map((item) => ({ value: item.id, label: item.name })), 'inter');
    const type = selectorField('Tipo de conta', ACCOUNT_TYPE_OPTIONS, 'checking');
    const nameInput = textField('Nome da conta');
    const balanceInput = moneyField('Saldo inicial');
    nameInput.placeholder = 'Ex.: Conta principal';
    let lastAutoName = '';
    institution.element.addEventListener('selectorchange', () => {
        const selected = getInstitution(institution.getValue() ?? undefined);
        const currentName = nameInput.value.trim();
        if (selected && (!currentName || currentName === lastAutoName)) {
            nameInput.value = selected.name;
            lastAutoName = selected.name;
        }
    });
    const form = el('form', 'form-stack', [institution.element, type.element, labeledField('Nome', nameInput), labeledField('Saldo inicial', balanceInput)]);
    const save = el('button', 'btn primary full-width', ['Salvar conta']);
    save.type = 'submit';
    form.append(save);
    const close = showSheet('Nova conta', form);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const institutionId = institution.getValue();
        const accountType = type.getValue();
        if (!institutionId || !accountType) {
            showToast('Selecione instituição e tipo de conta.', 'error');
            return;
        }
        save.disabled = true;
        const institutionData = getInstitution(institutionId);
        void createAccount(repositories.accounts, {
            profileId: profile.id,
            institutionId,
            type: accountType,
            name: nameInput.value,
            openingBalance: balanceInput.value || '0',
            color: institutionData?.color ?? '#58708f'
        }).then(() => {
            close();
            showToast('Conta criada.', 'success');
            onChanged();
        }).catch((error) => {
            save.disabled = false;
            showToast(error instanceof Error ? error.message : 'Não foi possível criar a conta.', 'error');
        });
    });
}
function openEditAccountSheet(repositories, profile, lifecycle, account, onChanged) {
    const institutions = listInstitutions();
    const institution = selectorField('Instituição', institutions.map((item) => ({ value: item.id, label: item.name })), account.institutionId ?? 'custom');
    const type = selectorField('Tipo de conta', ACCOUNT_TYPE_OPTIONS, account.type ?? 'other');
    const availability = selectorField('Disponibilidade', [
        { value: 'yes', label: 'Disponível para uso', description: 'Entra em Disponível agora e Livre para decidir.' },
        { value: 'no', label: 'Não disponível', description: 'Permanece patrimonial, mas não entra no caixa disponível.' }
    ], account.includeInAvailable === false ? 'no' : 'yes');
    const name = textField('Nome da conta', account.name);
    const note = el('div', 'inline-warning', ['O saldo inicial é preservado. Ajustes de saldo devem ser registrados como movimentações.']);
    const form = el('form', 'form-stack', [institution.element, type.element, availability.element, labeledField('Nome', name), note]);
    const save = el('button', 'btn primary full-width', ['Salvar alterações']);
    save.type = 'submit';
    form.append(save);
    const close = showSheet('Editar conta', form);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const institutionId = institution.getValue();
        const accountType = type.getValue();
        const available = availability.getValue();
        if (!institutionId || !accountType || !available) {
            showToast('Revise os campos da conta.', 'error');
            return;
        }
        save.disabled = true;
        void updateAccountDetails(repositories.accounts, lifecycle, {
            profileId: profile.id,
            accountId: account.id,
            name: name.value,
            institutionId,
            type: accountType,
            ...(getInstitution(institutionId)?.color ?? account.color ? { color: getInstitution(institutionId)?.color ?? account.color } : {}),
            includeInAvailable: available === 'yes'
        }).then(() => {
            close();
            showToast('Conta atualizada.', 'success');
            onChanged();
        }).catch((error) => {
            save.disabled = false;
            showToast(error instanceof Error ? error.message : 'Não foi possível atualizar a conta.', 'error');
        });
    });
}
