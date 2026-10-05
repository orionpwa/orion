import { getFinancialPosition } from '../../application/planning/get-financial-position.js';
import { addCents, formatBRL, subtractCents, sumCents, ZERO_CENTS } from '../../domain/money/money.js';
import { el } from '../dom.js';
function valueRow(label, value) {
    return el('div', 'patrimony-row-v1', [
        el('span', 'patrimony-row-label-v1', [label]),
        el('strong', 'patrimony-row-value-v1', [formatBRL(value)])
    ]);
}
function nonNegative(value) {
    return value < 0 ? ZERO_CENTS : value;
}
export async function renderPatrimonyV1(repositories, profile) {
    const position = await getFinancialPosition(repositories, profile.id);
    const registeredAssets = sumCents(position.assets
        .filter((item) => item.asset.includeInNetWorth)
        .map((item) => item.position.currentValue));
    const investments = sumCents(position.investments.map((item) => item.currentValue));
    const otherAssets = addCents(registeredAssets, investments);
    const cashAssets = nonNegative(subtractCents(position.netWorth.assets, otherAssets));
    const debts = sumCents(position.debts.map((item) => item.position.outstanding));
    const cards = sumCents(position.cards.map((item) => item.position.openLiability));
    const knownLiabilities = addCents(debts, cards);
    const accountLiabilities = nonNegative(subtractCents(position.netWorth.liabilities, knownLiabilities));
    const root = el('div', 'patrimony-screen-v1');
    const hero = el('section', 'patrimony-hero-v1', [
        el('span', 'patrimony-kicker-v1', ['PATRIMÔNIO LÍQUIDO']),
        el('strong', 'patrimony-net-v1', [formatBRL(position.netWorth.netWorth)]),
        el('div', 'patrimony-totals-v1', [
            valueRow('Ativos', position.netWorth.assets),
            valueRow('Passivos', position.netWorth.liabilities)
        ])
    ]);
    const assets = el('section', 'patrimony-section-v1', [
        el('h2', 'patrimony-section-title-v1', ['Ativos']),
        valueRow('Dinheiro em contas', cashAssets)
    ]);
    if (registeredAssets > 0)
        assets.append(valueRow('Outros ativos', registeredAssets));
    if (investments > 0)
        assets.append(valueRow('Investimentos', investments));
    const liabilities = el('section', 'patrimony-section-v1', [
        el('h2', 'patrimony-section-title-v1', ['Passivos'])
    ]);
    if (debts > 0)
        liabilities.append(valueRow('Dívidas', debts));
    if (cards > 0)
        liabilities.append(valueRow('Cartões de crédito', cards));
    if (accountLiabilities > 0)
        liabilities.append(valueRow('Saldos negativos em contas', accountLiabilities));
    if (position.netWorth.liabilities === 0) {
        liabilities.append(el('div', 'patrimony-empty-v1', ['Nenhum passivo registrado.']));
    }
    root.append(hero, assets, liabilities, el('p', 'patrimony-note-v1', ['Metas e reservas organizam o dinheiro disponível, mas não reduzem o patrimônio líquido.']));
    return root;
}
