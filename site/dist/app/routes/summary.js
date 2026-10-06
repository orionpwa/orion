import { createInvestmentInstrument } from '../../application/investments/create-instrument.js';
import { allocationBasisPoints, basisPointsToPercent, getPortfolioSnapshot, totalPortfolioPerformance } from '../../application/investments/portfolio.js';
import { recordInvestmentTrade } from '../../application/investments/record-trade.js';
import { IndexedDbEntityLifecycleMutationGateway } from '../../data/indexeddb/entity-lifecycle-mutations.js';
import { calculateInvestmentPosition } from '../../domain/investments/position.js';
import { formatQuantity } from '../../domain/investments/quantity.js';
import { addCents, formatBRL, ZERO_CENTS } from '../../domain/money/money.js';
import { el } from '../../presentation/dom.js';
import { renderHomeV0 } from '../../presentation/home.js';
import { accountChoiceFieldV0, accountErrorV0, accountInputFieldV0, accountMoneyFieldV0 } from '../../presentation/screens/accounts-v0/controls.js';
import { renderAssetDetailV1, renderAssetListV1, renderAssetValueV1, renderEditAssetV1, renderNewAssetV1, renderPatrimonyV1 } from '../../presentation/screens/patrimony-v1.js';

const ROUTES = new Set([
    'summary',
    'patrimony',
    'patrimony-investments',
    'patrimony-investment-new',
    'patrimony-investment-detail',
    'patrimony-investment-trade',
    'patrimony-assets',
    'patrimony-asset-new',
    'patrimony-asset-detail',
    'patrimony-asset-edit',
    'patrimony-asset-value'
]);
const assetLifecycle = new IndexedDbEntityLifecycleMutationGateway();
const INVESTMENT_CHOICES = [
    { value: 'stock-b3', label: 'Ação B3', assetClass: 'stock', venue: 'B3' },
    { value: 'reit', label: 'FII', assetClass: 'reit', venue: 'B3' },
    { value: 'etf', label: 'ETF B3', assetClass: 'etf', venue: 'B3' },
    { value: 'bdr', label: 'BDR', assetClass: 'bdr', venue: 'B3' },
    { value: 'crypto', label: 'Criptoativo', assetClass: 'crypto', venue: 'CRYPTO' },
    { value: 'stock-us', label: 'Ação internacional', assetClass: 'stock', venue: 'US' },
    { value: 'other', label: 'Outro listado', assetClass: 'other', venue: 'B3' }
];

function valueRow(label, value) {
    return el('div', 'patrimony-row-v1', [
        el('span', 'patrimony-row-label-v1', [label]),
        el('strong', 'patrimony-row-value-v1', [formatBRL(value)])
    ]);
}
function detailRow(label, value) {
    return el('div', 'patrimony-asset-detail-row-v1', [
        el('dt', '', [label]),
        el('dd', '', [value])
    ]);
}
function choiceDefinition(value) {
    return INVESTMENT_CHOICES.find((item) => item.value === value) ?? INVESTMENT_CHOICES[INVESTMENT_CHOICES.length - 1];
}
function classLabel(instrument) {
    if (instrument.venue === 'US' && instrument.assetClass === 'stock') return 'Ação internacional';
    if (instrument.venue === 'CRYPTO' && instrument.assetClass === 'crypto') return 'Criptoativo';
    if (instrument.assetClass === 'stock') return 'Ação B3';
    if (instrument.assetClass === 'reit') return 'FII';
    if (instrument.assetClass === 'etf') return 'ETF B3';
    if (instrument.assetClass === 'bdr') return 'BDR';
    return 'Outro listado';
}
function todayISO(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatTimestamp(value) {
    if (!value || !Number.isFinite(Date.parse(value)))
        return '—';
    return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function dateField(label, value) {
    const input = document.createElement('input');
    input.className = 'account-field-control-v0';
    input.type = 'date';
    input.value = value;
    input.setAttribute('aria-label', label);
    return { input, element: el('label', 'account-field-v0', [el('span', 'account-field-label-v0', [label]), input]) };
}
async function renderPatrimonyRoute(repositories, profile, actions) {
    const root = await renderPatrimonyV1(repositories, profile, actions);
    const assetsSection = root.querySelector('.patrimony-section-v1');
    if (assetsSection) {
        const investments = el('button', 'patrimony-manage-action-v1', ['Ver investimentos']);
        investments.type = 'button';
        investments.addEventListener('click', actions.onOpenInvestments);
        assetsSection.append(investments);
    }
    return root;
}
async function investmentContext(context, instrumentId) {
    const [instrument, trades, snapshot] = await Promise.all([
        context.repositories.investmentInstruments.getById(instrumentId),
        context.repositories.investmentTrades.listByProfile(context.profile.id),
        getPortfolioSnapshot(context.repositories, context.repositories.marketDataCache, context.profile.id)
    ]);
    if (!instrument || instrument.profileId !== context.profile.id || !instrument.active)
        throw new TypeError('Investimento não encontrado.');
    const position = calculateInvestmentPosition(instrument.id, trades);
    const portfolioItem = snapshot.items.find((item) => item.instrument.id === instrument.id) ?? null;
    return { instrument, position, portfolioItem };
}
async function renderInvestmentsRoute(context, actions) {
    const [instrumentsRaw, snapshot] = await Promise.all([
        context.repositories.investmentInstruments.listByProfile(context.profile.id),
        getPortfolioSnapshot(context.repositories, context.repositories.marketDataCache, context.profile.id)
    ]);
    const instruments = instrumentsRaw.filter((item) => item.active);
    const byId = new Map(snapshot.items.map((item) => [item.instrument.id, item]));
    const root = el('div', 'patrimony-assets-screen-v1');
    if (snapshot.items.length > 0) {
        const performance = totalPortfolioPerformance(snapshot);
        root.append(el('section', 'patrimony-hero-v1', [
            el('span', 'patrimony-kicker-v1', ['VALOR DA CARTEIRA']),
            el('strong', 'patrimony-net-v1', [formatBRL(snapshot.marketValue)]),
            el('div', 'patrimony-totals-v1', [
                valueRow('Custo', snapshot.costBasis),
                valueRow('Resultado', performance)
            ])
        ]));
    }
    const create = el('button', 'patrimony-primary-action-v1', ['Adicionar investimento']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    root.append(create);
    if (instruments.length > 0) {
        const refresh = el('button', 'account-secondary-action-v0', ['Atualizar cotações']);
        refresh.type = 'button';
        refresh.addEventListener('click', actions.onRefreshQuotes);
        root.append(refresh);
    }
    if (snapshot.missingQuotes > 0 || snapshot.staleQuotes > 0) {
        const notes = [];
        if (snapshot.missingQuotes > 0)
            notes.push(`${snapshot.missingQuotes} posição(ões) sem cotação e mostrada(s) pelo custo`);
        if (snapshot.staleQuotes > 0)
            notes.push(`${snapshot.staleQuotes} cotação(ões) desatualizada(s)`);
        root.append(el('p', 'patrimony-note-v1', [notes.join('. ') + '.']));
    }
    if (instruments.length === 0) {
        root.append(el('div', 'patrimony-assets-empty-v1', ['Nenhum investimento cadastrado.']));
        return root;
    }
    const list = el('div', 'patrimony-assets-list-v1');
    for (const instrument of instruments) {
        const item = byId.get(instrument.id);
        const allocation = item ? basisPointsToPercent(allocationBasisPoints(item, snapshot.marketValue)) : '';
        const meta = item
            ? `${formatQuantity(item.position.quantity)} un. · ${item.valuationBasis === 'market' ? 'valor de mercado' : 'valor pelo custo'}${allocation ? ` · ${allocation}` : ''}`
            : 'Sem posição';
        const row = el('button', 'patrimony-asset-row-v1', [
            el('span', 'patrimony-asset-copy-v1', [
                el('strong, '',