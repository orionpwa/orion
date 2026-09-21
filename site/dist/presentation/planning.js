import { getFinancialPosition } from '../application/planning/get-financial-position.js';
import { formatBRL, sumCents, ZERO_CENTS } from '../domain/money/money.js';
import { el } from './dom.js';
import { renderAllocationsSection, renderAssetsSection, renderCardsSection, renderDebtsSection, renderRecurrencesSection } from './screens/planning/sections.js';
export async function renderPlanningV3(repositories, profile, lifecycle, onChanged) {
    const position = await getFinancialPosition(repositories, profile.id);
    const context = { repositories, profile, lifecycle, onChanged };
    const root = el('div', 'screen-v3 planning-screen-v3');
    const debtTotal = sumCents(position.debts.map(item => item.position.outstanding));
    const reserveTotal = sumCents(position.allocations.map(item => item.amount));
    const focusText = debtTotal > ZERO_CENTS ? 'Quitar dívidas e fortalecer a reserva' : reserveTotal > ZERO_CENTS ? 'Fortalecer sua reserva' : 'Consolidar sua organização financeira';
    root.append(el('section', 'planning-focus-v3', [el('span', 'planning-focus-icon-v3', ['◎']), el('div', '', [el('small', '', ['FOCO DO MOMENTO']), el('strong', '', [focusText]), el('span', '', [debtTotal > ZERO_CENTS ? `${formatBRL(debtTotal)} em dívidas registradas.` : 'Organize compromissos e metas sem complicação.'])]), el('span', 'row-chevron-v3', ['›'])]));
    const rec = renderRecurrencesSection(context, position);
    rec.classList.add('module-v3');
    const debts = renderDebtsSection(context, position);
    debts.classList.add('module-v3');
    const alloc = renderAllocationsSection(context, position);
    alloc.classList.add('module-v3');
    root.append(rec, debts, alloc);
    const advanced = el('details', 'planning-more-v3', [el('summary', '', [el('span', '', ['Mais recursos']), el('small', '', ['Cartões, garantias e recursos avançados.'])]), el('div', 'planning-more-body-v3', [renderCardsSection(context, position), renderAssetsSection(context, position)])]);
    root.append(advanced);
    return root;
}
