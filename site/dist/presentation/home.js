import { getDashboardSnapshot } from '../application/dashboard/get-dashboard.js';
import { formatBRL, negateCents } from '../domain/money/money.js';
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
function amountRow(label, value, className = '') {
    return el('div', `summary-amount-row-v0 ${className}`.trim(), [
        el('span', 'summary-amount-label-v0', [label]),
        el('strong', 'summary-amount-value-v0', [value])
    ]);
}
function commitmentRow(item) {
    const meta = item.status === 'overdue'
        ? `Atrasado · ${shortDate(item.dueDate)}`
        : shortDate(item.dueDate);
    return el('div', 'summary-commitment-row-v0', [
        el('div', 'summary-commitment-copy-v0', [
            el('strong', 'summary-commitment-name-v0', [item.name]),
            el('span', item.status === 'overdue' ? 'summary-commitment-meta-v0 overdue' : 'summary-commitment-meta-v0', [meta])
        ]),
        el('strong', 'summary-commitment-value-v0', [formatBRL(item.amount)])
    ]);
}
export async function renderHomeV0(repositories, profile, actions) {
    const snapshot = await getDashboardSnapshot(repositories, profile.id);
    const root = el('div', 'summary-screen-v0');
    root.append(el('div', 'summary-period-v0', [monthLabel()]));
    const free = el('section', 'summary-free-v0', [
        el('span', 'summary-kicker-v0', ['LIVRE PARA DECIDIR']),
        el('strong', 'summary-free-value-v0', [formatBRL(snapshot.freeToDecide)]),
        el('div', 'summary-breakdown-v0', [
            amountRow('Disponível', formatBRL(snapshot.availableNow)),
            amountRow('Compromissos', formatBRL(negateCents(snapshot.plannedExpense))),
            amountRow('Metas e reservas', formatBRL(negateCents(snapshot.allocated)))
        ])
    ]);
    const month = el('section', 'summary-section-v0', [
        el('h2', 'summary-section-title-v0', ['Este mês'])
    ]);
    if (snapshot.monthTransactionCount === 0) {
        const goToMovements = el('button', 'summary-inline-action-v0', ['Ir para Movimentos ›']);
        goToMovements.type = 'button';
        goToMovements.addEventListener('click', actions.onOpenMovements);
        month.append(el('div', 'summary-empty-v0', [
            el('span', '', ['Ainda não há movimentações neste mês.']),
            goToMovements
        ]));
    }
    else {
        month.append(el('div', 'summary-month-values-v0', [
            amountRow('Entrou', formatBRL(snapshot.incomeMonth), 'positive'),
            amountRow('Saiu', formatBRL(snapshot.expenseMonth), 'negative'),
            amountRow('Resultado', formatBRL(snapshot.resultMonth), snapshot.resultMonth < 0 ? 'negative' : 'positive')
        ]));
    }
    const commitments = el('section', 'summary-section-v0', [
        el('h2', 'summary-section-title-v0', ['Próximos compromissos'])
    ]);
    if (snapshot.upcomingCommitments.length === 0) {
        commitments.append(el('div', 'summary-empty-v0', [
            el('span', '', ['Nenhum compromisso pendente neste mês.'])
        ]));
    }
    else {
        const list = el('div', 'summary-commitments-v0');
        for (const item of snapshot.upcomingCommitments)
            list.append(commitmentRow(item));
        commitments.append(list);
    }
    const resources = el('section', 'summary-section-v0', [
        el('h2', 'summary-section-title-v0', ['Mais recursos'])
    ]);
    const patrimony = el('button', 'summary-resource-row-v1', [
        el('span', 'summary-resource-copy-v1', [
            el('strong', 'summary-resource-name-v1', ['Patrimônio']),
            el('span', 'summary-resource-meta-v1', ['Ativos, passivos e patrimônio líquido'])
        ]),
        el('span', 'summary-resource-chevron-v1', ['›'])
    ]);
    patrimony.type = 'button';
    patrimony.addEventListener('click', actions.onOpenPatrimony);
    resources.append(patrimony);
    root.append(free, month, commitments, resources);
    return root;
}
