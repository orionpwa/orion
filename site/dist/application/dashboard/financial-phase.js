function normalizeLabel(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function isProtectionName(name) {
    const label = normalizeLabel(name);
    return label.includes('reserva')
        || label.includes('emergencia')
        || label.includes('seguranca')
        || label.includes('imprevisto');
}
function protectionRank(allocation) {
    const label = normalizeLabel(allocation.name);
    if (label.includes('reserva minima') || label.includes('emergencia'))
        return 0;
    if (isProtectionName(allocation.name))
        return 1;
    if (Number.isFinite(allocation.targetAmount) && allocation.targetAmount > 0)
        return 2;
    return 3;
}
export function selectPrimaryProtectionAllocation(allocations) {
    if (!Array.isArray(allocations) || allocations.length === 0)
        return null;
    return [...allocations].sort((left, right) => {
        const rankDiff = protectionRank(left) - protectionRank(right);
        if (rankDiff !== 0)
            return rankDiff;
        const leftHasTarget = Number.isFinite(left.targetAmount) && left.targetAmount > 0 ? 0 : 1;
        const rightHasTarget = Number.isFinite(right.targetAmount) && right.targetAmount > 0 ? 0 : 1;
        if (leftHasTarget !== rightHasTarget)
            return leftHasTarget - rightHasTarget;
        const amountDiff = Math.max(0, right.amount ?? 0) - Math.max(0, left.amount ?? 0);
        if (amountDiff !== 0)
            return amountDiff;
        return String(left.name ?? '').localeCompare(String(right.name ?? ''), 'pt-BR');
    })[0] ?? null;
}
export function progressPercent(current, target) {
    if (!Number.isFinite(target) || target <= 0)
        return null;
    return Math.min(100, Math.max(0, Math.round((Math.max(0, current) / target) * 100)));
}
export function buildDashboardPhase(snapshot) {
    const primary = selectPrimaryProtectionAllocation(snapshot.allocations);
    if (!primary) {
        if (snapshot.allocated > 0) {
            return {
                kind: 'reserve',
                title: 'Construindo proteção financeira',
                context: 'Valor protegido',
                current: snapshot.allocated,
                target: null,
                remaining: null,
                percent: null,
                progressHint: 'Defina um objetivo para acompanhar este valor protegido.',
                action: 'allocations',
                actionLabel: 'Organizar proteção'
            };
        }
        return {
            kind: 'foundation',
            title: 'Estruturando a base financeira',
            context: 'Reserva mínima ainda não criada',
            current: 0,
            target: null,
            remaining: null,
            percent: null,
            progressHint: 'Crie uma reserva para começar a construir sua proteção financeira.',
            action: 'allocations',
            actionLabel: 'Criar reserva'
        };
    }
    const current = Math.max(0, primary.amount ?? 0);
    const target = Number.isFinite(primary.targetAmount) && primary.targetAmount > 0
        ? primary.targetAmount
        : null;
    if (target === null) {
        return {
            kind: 'reserve',
            title: 'Construindo proteção financeira',
            context: primary.name,
            current,
            target: null,
            remaining: null,
            percent: null,
            progressHint: 'Defina um objetivo para acompanhar o progresso desta reserva.',
            action: 'allocations',
            actionLabel: 'Definir objetivo'
        };
    }
    const percent = progressPercent(current, target);
    const remaining = Math.max(0, target - current);
    if (current < target) {
        return {
            kind: 'reserve',
            title: 'Construindo proteção financeira',
            context: primary.name,
            current,
            target,
            remaining,
            percent,
            progressHint: null,
            action: 'allocations',
            actionLabel: 'Ver reserva'
        };
    }
    if (snapshot.debtOutstanding > 0) {
        return {
            kind: 'debt',
            title: 'Quitando dívidas',
            context: `${primary.name} protegida`,
            current: Math.max(0, snapshot.debtPaid),
            target: Math.max(0, snapshot.debtOpening),
            remaining: Math.max(0, snapshot.debtOutstanding),
            percent: progressPercent(snapshot.debtPaid, snapshot.debtOpening),
            progressHint: null,
            action: 'debts',
            actionLabel: 'Ver dívidas'
        };
    }
    return {
        kind: 'stable',
        title: 'Base financeira protegida',
        context: primary.name,
        current,
        target,
        remaining: 0,
        percent: 100,
        progressHint: null,
        action: 'planning',
        actionLabel: 'Ver planejamento'
    };
}
