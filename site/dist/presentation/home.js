import { getDashboardSnapshot } from '../application/dashboard/get-dashboard.js';
import { financialStatusLabel } from '../application/dashboard/financial-status.js';
import { buildDashboardPhase } from '../application/dashboard/financial-phase.js';
import { formatBRL } from '../domain/money/money.js';
import { el } from './dom.js';
function monthLabel(now = new Date()) {
    const text = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now);
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function shortDate(dateKey) {
    const parts = dateKey.split('-');
    const year = Number(parts[0] ?? '1970');
    const month = Number(parts[1] ?? '1');
    const day = Number(parts[2] ?? '1');
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
        .format(date)
        .replace('.', '');
}
function metricCard(label, value, support, className = '') {
    return el('div', `summary-base-metric-v2 ${className}`.trim(), [
        el('span', 'summary-base-metric-label-v2', [label]),
        el('strong', 'summary-base-metric-value-v2', [value]),
        el('small', 'summary-base-metric-support-v2', [support])
    ]);
}
function benefitLabel(item) {
    return item.account.institutionId === 'caju' ? 'Caju · VA' : item.account.name;
}
function benefitCompanion(snapshot) {
    const card = el('section', 'summary-base-benefit-companion-v2', [
        el('div', 'summary-base-benefit-companion-head-v2', [
            el('span', 'summary-base-kicker-v2', ['BENEFÍCIOS PARA USO']),
            el('small', '', ['Fora do Livre'])
        ])
    ]);
    const list = el('div', 'summary-base-benefit-companion-list-v2');
    for (const item of snapshot.benefits) {
        list.append(el('div', 'summary-base-benefit-companion-row-v2', [
            el('div', 'summary-base-benefit-companion-copy-v2', [
                el('strong', '', [benefitLabel(item)]),
                el('small', '', ['Benefício restrito · não entra no Livre para gastar'])
            ]),
            el('strong', 'summary-base-benefit-companion-value-v2', [formatBRL(item.balance)])
        ]));
    }
    card.append(list);
    if (snapshot.benefits.length > 1) {
        card.append(el('small', 'summary-base-benefit-companion-total-v2', [
            `Total em benefícios: ${formatBRL(snapshot.benefitTotal)}`
        ]));
    }
    return card;
}
function commitmentRow(item) {
    const meta = item.status === 'overdue'
        ? `Atrasado · ${shortDate(item.dueDate)}`
        : shortDate(item.dueDate);
    return el('div', 'summary-base-commitment-v2', [
        el('div', 'summary-base-commitment-copy-v2', [
            el('strong', '', [item.name]),
            el('span', item.status === 'overdue' ? 'overdue' : '', [meta])
        ]),
        el('strong', 'summary-base-commitment-value-v2', [formatBRL(item.amount)])
    ]);
}
function statusBadge(status) {
    const label = financialStatusLabel(status);
    const badge = el('div', `summary-base-month-signal-v2 ${status}`, [
        el('span', 'summary-base-month-signal-dot-v2'),
        el('strong', '', [label])
    ]);
    badge.setAttribute('aria-label', `Situação do mês: ${label}`);
    return badge;
}
function runPhaseAction(phase, actions) {
    if (phase.action === 'allocations')
        actions.onOpenAllocations();
    else if (phase.action === 'debts')
        actions.onOpenDebts();
    else
        actions.onOpenPlanning();
}
function phaseProgressMeta(phase) {
    if (phase.target === null)
        return phase.progressHint;
    if (phase.kind === 'debt')
        return phase.remaining > 0
            ? `${formatBRL(phase.remaining)} ainda em aberto.`
            : 'Dívidas quitadas.';
    if (phase.remaining > 0)
        return `Faltam ${formatBRL(phase.remaining)} para ${formatBRL(phase.target)}.`;
    return `Objetivo de ${formatBRL(phase.target)} alcançado.`;
}
function phaseCard(phase, actions) {
    const card = el('section', `summary-base-phase-v2 ${phase.kind}`, [
        el('div', 'summary-base-phase-heading-v2', [
            el('span', 'summary-base-kicker-v2', ['SUA FASE ATUAL']),
            el('strong', 'summary-base-phase-title-v2', [phase.title])
        ]),
        el('div', 'summary-base-phase-value-v2', [phase.context])
    ]);
    const hasTarget = phase.target !== null && phase.percent !== null;
    const progress = el('div', `summary-base-progress-v2${hasTarget ? '' : ' no-target'}`);
    const progressLeft = hasTarget
        ? `${formatBRL(phase.current)} de ${formatBRL(phase.target)}`
        : 'Progresso';
    const progressRight = hasTarget
        ? `${phase.percent}%`
        : phase.kind === 'foundation' ? 'A iniciar' : 'Sem objetivo';
    const progressHead = el('div', 'summary-base-progress-copy-v2', [
        el('span', '', [progressLeft]),
        el('strong', '', [progressRight])
    ]);
    const track = el('div', 'summary-base-progress-track-v2');
    if (hasTarget) {
        const fill = el('span', 'summary-base-progress-fill-v2');
        fill.style.width = `${phase.percent}%`;
        track.setAttribute('role', 'progressbar');
        track.setAttribute('aria-valuemin', '0');
        track.setAttribute('aria-valuemax', '100');
        track.setAttribute('aria-valuenow', String(phase.percent));
        track.append(fill);
    }
    else {
        track.setAttribute('aria-label', 'Objetivo ainda não definido');
    }
    const meta = phaseProgressMeta(phase);
    progress.append(progressHead, track);
    if (meta)
        progress.append(el('small', 'summary-base-progress-hint-v2', [meta]));
    card.append(progress);
    const action = el('button', 'summary-base-phase-action-v2', [
        el('span', '', [phase.actionLabel]),
        el('span', 'summary-base-phase-action-chevron-v2', ['›'])
    ]);
    action.type = 'button';
    action.addEventListener('click', () => runPhaseAction(phase, actions));
    card.append(action);
    return card;
}
function section(title, children = [], className = '') {
    return el('section', `summary-base-section-v2 ${className}`.trim(), [
        el('h2', 'summary-base-section-title-v2', [title]),
        ...children
    ]);
}
function resourceRow(title, support, onClick) {
    const row = el('button', 'summary-base-resource-v2', [
        el('span', '', [el('strong', '', [title]), el('small', '', [support])]),
        el('span', 'summary-base-resource-chevron-v2', ['›'])
    ]);
    row.type = 'button';
    row.addEventListener('click', onClick);
    return row;
}
export async function renderHomeV0(repositories, profile, actions) {
    const snapshot = await getDashboardSnapshot(repositories, profile.id);
    const phase = buildDashboardPhase(snapshot);
    const root = el('div', 'summary-screen-v0 summary-base-v2');
    root.append(el('div', 'summary-base-period-v2', [monthLabel()]));
    const hero = el('section', 'summary-base-hero-v2', [
        el('span', 'summary-base-kicker-v2', ['LIVRE PARA GASTAR']),
        el('strong', 'summary-base-hero-value-v2', [formatBRL(snapshot.freeToDecide)]),
        el('p', 'summary-base-hero-support-v2', ['Após reservas, benefícios restritos e compromissos planejados.'])
    ]);
    hero.append(statusBadge(snapshot.status));
    root.append(hero);
    if (snapshot.benefits.length > 0)
        root.append(benefitCompanion(snapshot));
    root.append(phaseCard(phase, actions));
    root.append(el('div', 'summary-base-metrics-v2', [
        metricCard('Protegido', formatBRL(snapshot.allocated), 'Reservas separadas', 'protected'),
        metricCard('Comprometido', formatBRL(snapshot.plannedExpense), 'Compromissos do mês', 'committed'),
        metricCard('Dívidas', formatBRL(snapshot.debtOutstanding), 'Saldo ainda a eliminar', 'debt'),
        metricCard('Disponível', formatBRL(snapshot.availableNow), 'Dinheiro livre em contas', 'available')
    ]));
    const commitments = section('Próximos compromissos', [], 'summary-base-flat-v2');
    if (snapshot.upcomingCommitments.length === 0) {
        commitments.append(el('div', 'summary-base-empty-v2', ['Nenhum compromisso pendente neste mês.']));
    }
    else {
        const list = el('div', 'summary-base-commitments-v2');
        for (const item of snapshot.upcomingCommitments)
            list.append(commitmentRow(item));
        commitments.append(list);
    }
    root.append(commitments);
    const month = section('Este mês', [], 'summary-base-surface-v2 month');
    if (snapshot.monthTransactionCount === 0) {
        const goToMovements = el('button', 'summary-base-link-v2', ['Ir para Movimentos ›']);
        goToMovements.type = 'button';
        goToMovements.addEventListener('click', actions.onOpenMovements);
        month.append(el('div', 'summary-base-empty-v2', [
            el('span', '', ['Ainda não há movimentações neste mês.']),
            goToMovements
        ]));
    }
    else {
        month.append(el('div', 'summary-base-month-grid-v2', [
            metricCard('Entrou', formatBRL(snapshot.incomeMonth), 'Receitas do mês', 'positive'),
            metricCard('Saiu', formatBRL(snapshot.expenseMonth), 'Despesas do mês', 'negative'),
            metricCard('Resultado', formatBRL(snapshot.resultMonth), 'Entradas menos saídas', snapshot.resultMonth < 0 ? 'negative' : 'positive')
        ]));
        const goToMovements = el('button', 'summary-base-link-v2', ['Ver Movimentos ›']);
        goToMovements.type = 'button';
        goToMovements.addEventListener('click', actions.onOpenMovements);
        month.append(goToMovements);
    }
    root.append(month);
    const resources = section('Mais recursos', [], 'summary-base-flat-v2 resources');
    resources.append(resourceRow('Patrimônio', 'Ativos, passivos e patrimônio líquido', actions.onOpenPatrimony));
    root.append(resources);
    return root;
}
