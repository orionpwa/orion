import { getDashboardSnapshot } from '../../../application/dashboard/get-dashboard.js';
import { formatBRL } from '../../../domain/money/money.js';
import { getInstitution } from '../../../catalog/institutions.js';
import { el } from '../../dom.js';
import { institutionLogo } from '../../institutions.js';
import { accountTypeLabel } from './shared.js';
import { renderCardListV1 } from './cards.js';
export async function renderAccountsRootV0(context, actions) {
    const snapshot = await getDashboardSnapshot(context.repositories, context.profile.id);
    const root = el('div', 'accounts-screen-v0');
    const accountsSection = el('section', 'accounts-account-section-v1');
    accountsSection.append(el('div', 'accounts-section-title-v1', [el('h2', '', ['Contas'])]));
    const add = el('button', 'accounts-inline-primary-v0', ['Adicionar conta']);
    add.type = 'button';
    add.addEventListener('click', actions.onCreate);
    accountsSection.append(add);
    if (snapshot.accounts.length === 0) {
        accountsSection.append(el('div', 'accounts-empty-compact-v1', ['Nenhuma conta cadastrada.']));
    }
    else {
        const list = el('div', 'accounts-list-v0');
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
        accountsSection.append(list);
    }
    root.append(accountsSection);
    root.append(await renderCardListV1(context, {
        onCreate: actions.onCreateCard,
        onOpenDetail: actions.onOpenCardDetail
    }));
    return root;
}
