import { getDashboardSnapshot } from '../application/dashboard/get-dashboard.js';
import { financialStatusLabel } from '../application/dashboard/financial-status.js';
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
function normalizeLabel(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function percentFor(current, target) {
    if (!Number.isFinite(target) || target <= 0)
        return null;
    return Math.min(100, Math.max(0, Math.round((Math.max(0, current) / target) * 100)));
}
function selectReserve(allocations) {
    const reserves = allocations.filter((item) => normalizeLabel(item.name).includes('reserva'));
    reserves.sort((left, right) => {
        const leftMinimum = normalizeLabel(left.name).includes('minima') ? 0 : 1;
        const rightMinimum = normalizeLabel(right.name).includes('minima') ? 0 : 1;
        if (leftMinimum !== rightMinimum)
            return leftMinimum - rightMinimum;
        return left.name.localeCompare(right.name, 'pt-BR');
    });
    return reserves[0] ?? null;
}
function phaseFor(snapshot) {
    const reserve = selectReserve(snapshot.allocations);
    if (!reserve) {
        return {
            kind: 'foundation',
            title: 'Estruturando a base financeira',
            value: 'Reserva mínima ainda não criada',
            percent: null,
            nextStep: 'Crie sua reserva mínima em Planejar. O valor reservado ficará automaticamente fora do Livre para gastar.',
            action: 'allocations',
            actionLabel: 'Planejar reserva'
        };
    }
    if (reserve.targetAmount === undefined || reserve.targetAmount <= 0) {
        return {
            kind: 'reserve',
            title: 'Construindo reserva mínima',
            value: `${formatBRL(reserve.amount)} protegidos`,
            percent: null,
            nextStep: 'Defina um objetivo total para a reserva para acompanhar o progresso até o próximo marco.',
            action: 'allocations',
            actionLabel: 'Ver reserva'
        };
    }
    if (reserve.amount < reserve.targetAmount) {
        const remaining = Math.max(0, reserve.targetAmount - reserve.amount);
        return {
            kind: 'reserve',
            title: 'Construindo reserva mínima',
            value: `${formatBRL(reserve.amount)} / ${formatBRL(reserve.targetAmount)}`,
            percent: percentFor(reserve.amount, reserve.targetAmount),
            nextStep: `Faltam ${formatBRL(remaining)} para concluir a reserva mínima.`,
            action: 'allocations',
            actionLabel: 'Ver reserva'
        };
    }
    if (snapshot.debtOutstanding > 0) {
        return {
            kind: 'debt',
            title: 'Quitando dívidas',
            value: `${formatBRL(snapshot.debtOutstanding)} ainda em aberto`,
            percent: percentFor(snapshot.debtPaid, snapshot.debtOpening),
            nextStep: 'A reserva mínima está protegida. O próximo foco é reduzir as dívidas ativas sem usar esse valor reservado.',
            action: 'debts',
            actionLabel: 'Ver dívidas'
        };
    }
    return {
        kind: 'stable',
        title: 'Base financeira protegida',
        value: `${formatBRL(reserve.amount)} em reserva`,
        percent: 100,
        nextStep: 'Reserva mínima concluída e nenhuma dívida ativa. Continue fortalecendo a base antes de abrir uma nova frente.',
        action: 'planning',
        actionLabel: 'Ver planejamento'
    };
}
function metricCard(label, value, support, className = '') {
    return el('div', `summary-base-metric-v2 ${className}`.trim(), [
        el('span', 'summary-base-metric-label-v2', [label]),
        el('strong', 'summary-base-metric-value-v2', [value]),
        el('small', 'summary-base-metric-support-v2', [support])
    ]);
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
function statusDescription(status) {
    if (status === 'tight')
        return 'O dinheiro livre ou disponível ficou abaixo de zero. Priorize somente o essencial.';
    if (status === 'attention')
        return 'O mês pede atenção ao resultado e ao dinheiro já comprometido.';
    return 'O caixa atual comporta o que está planejado neste momento.';
}
function statusCard(status) {
    return el('div', `summary-base-status-v2 ${status}`, [
        el('span', 'summary-base-status-dot-v2'),
        el('div', 'summary-base-status-copy-v2', [
            el('strong', '', [financialStatusLabel(status)]),
            el('span', '', [statusDescription(status)])
        ])
    ]);
}
function phaseCard(phase, actions) {
    const card = el('section', `summary-base-phase-v2 ${phase.kind}`, [
        el('div', 'summary-base-phase-heading-v2', [
            el('span', 'summary-base-kicker-v2', ['SUA FASE ATUAL']),
            el('strong', 'summary-base-phase-title-v2', [phase.title])
        ]),
        el('div', 'summary-base-phase-value-v2', [phase.value])
    ]);
    if (phase.percent !== null) {
        const track = el('div', 'summary-base-progress-track-v2');
        const fill = el('span', 'summary-base-progress-fill-v2');
        fill.style.width = `${phase.percent}%`;
        track.setAttribute('role', 'progressbar');
        track.setAttribute('aria-valuemin', '0');
        track.setAttribute('aria-valuemax', '100');
        track.setAttribute('aria-valuenow', String(phase.percent));
        track.append(fill);
        card.append(el('div', 'summary-base-progress-v2', [
            el('div', 'summary-base-progress-copy-v2', [
                el('span', '', ['Progresso']),
                el('strong', '', [`${phase.percent}%`])
            ]),
            track
        ]));
    }
    const action = el('button', 'summary-base-phase-action-v2', [phase.actionLabel, ' ›']);
    action.type = 'button';
    action.addEventListener('click', () => {
        if (phase.action === 'allocations')
            actions.onOpenAllocations();
        else if (phase.action === 'debts')
            actions.onOpenDebts();
        else
            actions.onOpenPlanning();
    });
    card.append(action);
    return card;
}
function section(title, children = []) {
    return el('section', 'summary-base-section-v2', [
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
    const phase = phaseFor(snapshot);
    const root = el('div', 'summary-screen-v0 summary-base-v2');
    root.append(el('div', 'summary-base-period-v2', [monthLabel()]));
    root.append(el('section', 'summary-base-hero-v2', [
        el('span', 'summary-base-kicker-v2', ['LIVRE PARA GASTAR']),
        el('strong', 'summary-base-hero-value-v2', [formatBRL(snapshot.freeToDecide)]),
        el('p', 'summary-base-hero-support-v2', ['Depois de separar reservas e considerar os compromissos planejados.'])
    ]));
    root.append(phaseCard(phase, actions));
    root.append(el('div', 'summary-base-metrics-v2', [
        metricCard('Protegido', formatBRL(snapshot.allocated), 'Reservas separadas', 'protected'),
        metricCard('Comprometido', formatBRL(snapshot.plannedExpense), 'Compromissos do mês', 'committed'),
        metricCard('Dívidas', formatBRL(snapshot.debtOutstanding), 'Saldo ainda a eliminar', 'debt'),
        metricCard('Disponível', formatBRL(snapshot.availableNow), 'Total disponível em contas', 'available')
    ]));
    const nextAction = el('button', 'summary-base-next-action-v2', [phase.nextStep, el('span', '', ['›'])]);
    nextAction.type = 'button';
    nextAction.addEventListener('click', () => {
        if (phase.action === 'allocations')
            actions.onOpenAllocations();
        else if (phase.action === 'debts')
            actions.onOpenDebts();
        else
            actions.onOpenPlanning();
    });
    root.append(section('Próximo passo', [nextAction]));
    root.append(section('Situação do mês', [statusCard(snapshot.status)]));
    const commitments = section('Próximos compromissos');
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
    const month = section('Este mês');
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
    const resources = section('Mais recursos');
    resources.append(resourceRow('Patrimônio', 'Ativos, passivos e patrimônio líquido', actions.onOpenPatrimony));
    root.append(resources);
    return root;
}
