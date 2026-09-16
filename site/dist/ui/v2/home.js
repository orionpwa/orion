import { getDashboardSnapshot } from '../../application/dashboard/get-dashboard.js';
import { financialStatusLabel } from '../../application/dashboard/financial-status.js';
import { formatBRL } from '../../domain/money/money.js';
import { getInstitution } from '../../catalog/institutions.js';
import { el } from '../dom.js';
import { institutionBrand } from './institution-brand.js';
function metric(label, value, tone) {
    return el('div', 'metric-tile metric-tile-v2', [
        el('span', `metric-dot ${tone}`),
        el('div', 'metric-copy', [el('small', '', [label]), el('strong', '', [value])])
    ]);
}
export async function renderHomeV2(repositories, profile, actions) {
    const snapshot = await getDashboardSnapshot(repositories, profile.id);
    const root = el('div', 'screen home-screen home-screen-v2');
    const balance = el('section', 'hero-card hero-card-v2', [
        el('div', 'hero-card-top', [
            el('span', 'eyebrow', ['DISPONÍVEL AGORA']),
            el('span', `status-pill status-${snapshot.status}`, [financialStatusLabel(snapshot.status)])
        ]),
        el('strong', 'hero-money hero-money-v2', [formatBRL(snapshot.availableNow)]),
        el('div', 'metrics-grid metrics-grid-v2', [
            metric('Entrou no mês', formatBRL(snapshot.incomeMonth), 'positive'),
            metric('Saiu no mês', formatBRL(snapshot.expenseMonth), 'negative'),
            metric('Resultado', formatBRL(snapshot.resultMonth), snapshot.resultMonth >= 0 ? 'positive' : 'negative'),
            metric('Livre para decidir', formatBRL(snapshot.freeToDecide), 'accent')
        ]),
        el('small', 'metric-note', ['Disponível menos compromissos previstos e valores reservados para metas.'])
    ]);
    const priority = el('button', 'priority-card priority-card-v2', [
        el('span', 'priority-icon', ['✦']),
        el('div', '', [
            el('small', '', ['PRÓXIMA PRIORIDADE']),
            el('strong', '', [snapshot.plannedExpense > 0 ? 'Cobrir compromissos previstos' : 'Consolidar a base financeira']),
            el('span', '', [snapshot.plannedExpense > 0 ? `${formatBRL(snapshot.plannedExpense)} previstos no mês.` : 'Mantenha contas, registros e patrimônio consistentes.'])
        ]),
        el('span', 'priority-chevron', ['›'])
    ]);
    priority.type = 'button';
    priority.addEventListener('click', actions.onOpenPlanning);
    const accountsSection = el('section', 'section-block home-accounts-section home-accounts-v2');
    const openAccounts = el('button', 'text-action text-action-v2', ['Ver todas']);
    openAccounts.type = 'button';
    openAccounts.addEventListener('click', actions.onOpenAccounts);
    accountsSection.append(el('div', 'section-title-row', [el('h2', '', ['Contas rápidas']), openAccounts]));
    const visibleAccounts = snapshot.accounts.filter((account) => (snapshot.balances.get(account.id) ?? 0) !== 0);
    if (snapshot.accounts.length === 0) {
        const add = el('button', 'btn secondary compact', ['Adicionar primeira conta']);
        add.type = 'button';
        add.addEventListener('click', actions.onOpenAccounts);
        accountsSection.append(el('div', 'empty-card actionable-empty home-empty-v2', [
            el('strong', '', ['Sua base financeira começa pelas contas']),
            el('span', '', ['Cadastre onde seu dinheiro está para o Orion organizar os saldos com precisão.']),
            add
        ]));
    }
    else if (visibleAccounts.length === 0) {
        accountsSection.append(el('div', 'home-zero-accounts-v2', [
            el('span', '', ['Suas contas estão zeradas.']),
            el('button', 'text-action', ['Gerenciar contas'])
        ]));
        const button = accountsSection.querySelector('.home-zero-accounts-v2 button');
        button?.addEventListener('click', actions.onOpenAccounts);
    }
    else {
        const list = el('div', 'home-account-grid home-account-grid-v2');
        for (const account of visibleAccounts.slice(0, 4)) {
            const institution = getInstitution(account.institutionId);
            const balanceValue = snapshot.balances.get(account.id);
            const tile = el('button', 'home-account-tile home-account-tile-v2', [
                institutionBrand(account.institutionId, account.name, 'institution-brand-v2 home-account-brand-v2'),
                el('div', 'home-account-copy', [
                    el('strong', '', [account.name]),
                    el('small', '', [institution?.name ?? 'Conta'])
                ]),
                el('b', 'home-account-balance', [balanceValue === undefined ? '—' : formatBRL(balanceValue)]),
                el('span', 'home-account-chevron-v2', ['›'])
            ]);
            tile.type = 'button';
            tile.addEventListener('click', actions.onOpenAccounts);
            if (account.color)
                tile.style.setProperty('--institution-color', account.color);
            list.append(tile);
        }
        accountsSection.append(list);
    }
    root.append(balance, priority, accountsSection);
    return root;
}
