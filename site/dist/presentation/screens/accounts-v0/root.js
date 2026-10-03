import { getDashboardSnapshot } from '../../../application/dashboard/get-dashboard.js';
import { formatBRL } from '../../../domain/money/money.js';
import { getInstitution } from '../../../catalog/institutions.js';
import { el } from '../../dom.js';
import { institutionLogo } from '../../institutions.js';
import { accountTypeLabel } from './shared.js';
export async function renderAccountsRootV0(context, actions) {
    const snapshot = await getDashboardSnapshot(context.repositories, context.profile.id);
    const root = el('div', 'accounts-screen-v0');
    const add = el('button', 'accounts-inline-primary-v0', ['Adicionar conta']);
    add.type = 'button';
    add.addEventListener('click', actions.onCreate);
    root.append(add);
    if (snapshot.accounts.length === 0) {
        root.append(el('section', 'accounts-empty-v0', [
            el('strong', '', ['Nenhuma conta cadastrada.']),
            el('span', '', ['Adicione onde seu dinheiro está para começar a acompanhar os saldos.'])
        ]));
        return root;
    }
    const list = el('section', 'accounts-list-v0');
    for (const account of snapshot.accounts) {
        const institution = getInstitution(account.institutionId);
        const balance = snapshot.balances.get(account.id) ?? account.openingBalance;
        const row = el('button', 'account-row-v0', [
            institutionLogo(account.institutionId, institution?.shortName ?? account.name, 'account-logo-v0'),
            el('span', 'account-row-copy-v0', [
                el('strong', '', [account.name]),
                el('small', '', [accountTypeLabel(account)])
            ]),
            el('strong', 'account-row-balance-v0', [formatBRL(balance)]),
            el('span', 'account-row-chevron-v0', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(account.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
