import { getDashboardSnapshot } from '../application/dashboard/get-dashboard.js';
import { financialStatusLabel } from '../application/dashboard/financial-status.js';
import { formatBRL, ZERO_CENTS } from '../domain/money/money.js';
import { getInstitution } from '../catalog/institutions.js';
import { el } from './dom.js';
import { institutionLogo } from './institutions.js';
function metric(label, value, tone, symbol) {
    return el('div', `metric-card-v3 ${tone}`, [el('span', 'metric-icon-v3', [symbol]), el('div', 'metric-copy-v3', [el('small', '', [label]), el('strong', '', [value])])]);
}
export async function renderHomeV3(repositories, profile, actions) {
    const snapshot = await getDashboardSnapshot(repositories, profile.id);
    const root = el('div', 'screen-v3 home-screen-v3');
    const hero = el('section', 'hero-card-v3', [
        el('div', 'hero-top-v3', [el('span', 'eyebrow-v3', ['DISPONÍVEL AGORA']), el('span', `status-pill-v3 status-${snapshot.status}`, [el('span', 'status-dot-v3', ['!']), financialStatusLabel(snapshot.status), el('span', 'status-chevron-v3', ['›'])])]),
        el('strong', 'hero-money-v3', [formatBRL(snapshot.availableNow)]),
        el('div', 'metrics-grid-v3', [
            metric('Entrou no mês', formatBRL(snapshot.incomeMonth), 'positive', '↑'),
            metric('Saiu no mês', formatBRL(snapshot.expenseMonth), 'negative', '↓'),
            metric('Resultado', formatBRL(snapshot.resultMonth), snapshot.resultMonth >= 0 ? 'positive' : 'result', '▥'),
            metric('Livre para decidir', formatBRL(snapshot.freeToDecide), 'accent', '◔')
        ]),
        el('small', 'hero-note-v3', ['*Disponível menos compromissos previstos e valores reservados para metas.'])
    ]);
    const priority = el('button', 'priority-card-v3', [el('span', 'priority-icon-v3', ['◎']), el('div', 'priority-copy-v3', [el('small', '', ['PRÓXIMA PRIORIDADE']), el('strong', '', [snapshot.plannedExpense > 0 ? 'Cobrir compromissos previstos' : 'Consolidar a base financeira']), el('span', '', [snapshot.plannedExpense > 0 ? `${formatBRL(snapshot.plannedExpense)} previstos no mês.` : 'Mantenha contas, registros e patrimônio consistentes.'])]), el('span', 'priority-chevron-v3', ['›'])]);
    priority.type = 'button';
    priority.addEventListener('click', actions.onOpenPlanning);
    const accounts = el('section', 'quick-accounts-v3', [el('h2', 'section-title-v3', ['Contas rápidas'])]);
    const visible = snapshot.accounts.filter(a => (snapshot.balances.get(a.id) ?? 0) !== 0).slice(0, 4);
    if (visible.length === 0) {
        accounts.append(el('div', 'quick-empty-v3', [el('strong', '', ['Nenhuma conta com saldo agora.']), el('span', '', ['As contas zeradas continuam disponíveis na área Contas.'])]));
    }
    else {
        const grid = el('div', 'quick-account-grid-v3');
        for (const account of visible) {
            const institution = getInstitution(account.institutionId);
            const balance = snapshot.balances.get(account.id) ?? ZERO_CENTS;
            grid.append(el('article', 'quick-account-card-v3', [institutionLogo(account.institutionId, institution?.shortName ?? account.name), el('div', 'quick-account-copy-v3', [el('strong', '', [account.name]), el('small', '', [account.type === 'benefit' ? 'Conta de pagamento' : institution?.kind === 'wallet' ? 'Conta digital' : institution?.name ?? 'Conta'])]), el('b', 'quick-account-value-v3', [formatBRL(balance)])]));
        }
        accounts.append(grid);
    }
    root.append(hero, priority, accounts);
    return root;
}
