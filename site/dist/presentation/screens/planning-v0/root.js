import { getFinancialPosition } from '../../../application/planning/get-financial-position.js';
import { formatBRL, sumCents } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
export async function renderPlanningRootV0(context, actions) {
    const position = await getFinancialPosition(context.repositories, context.profile.id);
    const debtTotal = sumCents(position.debts.map((item) => item.position.outstanding));
    const commitmentTotal = position.commitments.plannedExpense;
    const allocationTotal = sumCents(position.allocations.map((item) => item.amount));
    const root = el('div', 'planning-screen-v0');
    root.append(el('p', 'planning-root-intro-v0', ['Organize o que ainda vai acontecer sem misturar planejamento com movimentações já realizadas.']));
    const rows = el('div', 'planning-domain-list-v0');
    const domain = (title, support, value, onClick) => {
        const button = el('button', 'planning-domain-row-v0', [
            el('span', 'planning-domain-copy-v0', [el('strong', '', [title]), el('small', '', [support])]),
            el('span', 'planning-domain-side-v0', [el('strong', '', [value]), el('span', '', ['›'])])
        ]);
        button.type = 'button';
        button.addEventListener('click', onClick);
        return button;
    };
    rows.append(domain('Compromissos', `${position.recurrences.length} cadastrado${position.recurrences.length === 1 ? '' : 's'}`, formatBRL(commitmentTotal), actions.onOpenCommitments), domain('Dívidas', `${position.debts.length} ativa${position.debts.length === 1 ? '' : 's'}`, formatBRL(debtTotal), actions.onOpenDebts), domain('Metas e reservas', `${position.allocations.length} ativa${position.allocations.length === 1 ? '' : 's'}`, formatBRL(allocationTotal), actions.onOpenAllocations));
    root.append(rows);
    return root;
}
