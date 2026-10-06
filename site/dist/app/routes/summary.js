import { createInvestmentInstrument } from '../../application/investments/create-instrument.js';
import { saveManualFundamentals } from '../../application/investments/manual-fundamentals.js';
import { allocationBasisPoints, basisPointsToPercent, getPortfolioSnapshot, totalPortfolioPerformance } from '../../application/investments/portfolio.js';
import { assessFundamentals } from '../../application/investments/radar-assessment.js';
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
const INVESTMENT_CLASSES = [
    { value: 'stock', label: 'Ação' },
    { value: 'bdr', label: 'BDR' },
    { value: 'reit', label: 'FII' },
    { value: 'etf', label: 'ETF' },
    { value: 'other', label: 'Outro listado' }
];
const RADAR_METRICS = [
    ['pe_ratio', 'P/L'],
    ['pb_ratio', 'P/VP'],
    ['ev_ebitda', 'EV/EBITDA'],
    ['dividend_yield_pct', 'Dividend Yield (%)'],
    ['roe_pct', 'ROE (%)'],
    ['roic_pct', 'ROIC (%)'],
    ['net_margin_pct', 'Margem líquida (%)'],
    ['revenue_growth_pct', 'Crescimento da receita (%)'],
    ['earnings_growth_pct', 'Crescimento do lucro (%)'],
    ['current_ratio', 'Liquidez corrente'],
    ['debt_to_equity_ratio', 'Dívida / patrimônio'],
    ['net_debt_to_ebitda', 'Dívida líquida / EBITDA']
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
function classLabel(value) {
    return INVESTMENT_CLASSES.find((item) => item.value === value)?.label ?? 'Outro';
}
function todayISO(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function dateField(label, value) {
    const input = document.createElement('input');
    input.className = 'account-field-control-v0';
    input.type = 'date';
    input.value = value;
    input.setAttribute('aria-label', label);
    return { input, element: el('label', 'account-field-v0', [el('span', 'account-field-label-v0', [label]), input]) };
}
function instrumentRef(instrument) {
    return { symbol: instrument.providerSymbol ?? instrument.symbol, venue: instrument.venue, currency: instrument.currency };
}
function radarSupported(instrument) {
    return instrument.venue === 'B3' && (instrument.assetClass === 'stock' || instrument.assetClass === 'bdr');
}
function recommendationFor(assessment) {
    if (assessment.adherence === 'high')
        return { label: 'Boa candidata', rank: 3 };
    if (assessment.adherence === 'moderate')
        return { label: 'Em observação', rank: 2 };
    if (assessment.adherence === 'low')
        return { label: 'Não priorizar', rank: 1 };
    return { label: 'Dados insuficientes', rank: 0 };
}
function metricValue(snapshot, metric) {
    const item = snapshot?.metrics?.find((entry) => entry.metric === metric);
    if (!item)
        return null;
    const suffix = item.unit === 'percent' ? '%' : '';
    return `${item.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`;
}
async function radarForInstrument(context, instrument) {
    if (!radarSupported(instrument))
        return { kind: 'unsupported', recommendation: 'Critério específico pendente', score: null, snapshot: null, assessment: null };
    const snapshot = await context.repositories.marketDataCache.getFundamentals(instrumentRef(instrument));
    if (!snapshot)
        return { kind: 'missing', recommendation: 'Sem fundamentos', score: null, snapshot: null, assessment: null };
    const assessment = assessFundamentals(snapshot);
    const recommendation = recommendationFor(assessment);
    return { kind: 'assessment', recommendation: recommendation.label, rank: recommendation.rank, score: assessment.scorePercent, snapshot, assessment };
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

    const radarItems = await Promise.all(instruments.map(async (instrument) => ({ instrument, radar: await radarForInstrument(context, instrument) })));
    const analyzed = radarItems
        .filter((item) => item.radar.kind === 'assessment')
        .sort((left, right) => (right.radar.rank - left.radar.rank) || ((right.radar.score ?? -1) - (left.radar.score ?? -1)) || left.instrument.symbol.localeCompare(right.instrument.symbol));
    const radarSection = el('section', 'patrimony-section-v1', [el('h2', 'patrimony-section-title-v1', ['Radar'])]);
    if (analyzed.length === 0) {
        radarSection.append(el('div', 'patrimony-empty-v1', ['Nenhum ativo com fundamentos suficientes para ranquear. Abra um investimento para inserir dados do briefing.']));
    }
    else {
        const radarList = el('div', 'patrimony-assets-list-v1');
        for (const { instrument, radar } of analyzed.slice(0, 5)) {
            const row = el('button', 'patrimony-asset-row-v1', [
                el('span', 'patrimony-asset-copy-v1', [
                    el('strong', '', [`${instrument.symbol} · ${instrument.name}`]),
                    el('small', '', [radar.recommendation])
                ]),
                el('strong', 'patrimony-asset-value-v1', [radar.score == null ? '—' : `${radar.score}%`]),
                el('span', 'patrimony-asset-chevron-v1', ['›'])
            ]);
            row.type = 'button';
            row.addEventListener('click', () => actions.onOpenDetail(instrument.id));
            radarList.append(row);
        }
        radarSection.append(radarList, el('p', 'patrimony-note-v1', ['O Radar é um filtro explicável de qualidade e valuation, não uma ordem automática de compra.']));
    }
    const fiiCount = radarItems.filter((item) => item.instrument.assetClass === 'reit').length;
    if (fiiCount > 0)
        radarSection.append(el('p', 'patrimony-note-v1', [`${fiiCount} FII(s) aguardam a régua específica de fundos imobiliários; eles não são avaliados com critérios de ações.`]));
    root.append(radarSection);

    const list = el('div', 'patrimony-assets-list-v1');
    for (const instrument of instruments) {
        const item = byId.get(instrument.id);
        const radar = radarItems.find((entry) => entry.instrument.id === instrument.id)?.radar;
        const allocation = item ? basisPointsToPercent(allocationBasisPoints(item, snapshot.marketValue)) : '';
        const positionMeta = item
            ? `${formatQuantity(item.position.quantity)} un. · ${item.valuationBasis === 'market' ? 'cotação' : 'custo'}${allocation ? ` · ${allocation}` : ''}`
            : 'Sem posição';
        const radarMeta = radar?.kind === 'assessment' ? ` · Radar: ${radar.recommendation}` : '';
        const row = el('button', 'patrimony-asset-row-v1', [
            el('span', 'patrimony-asset-copy-v1', [
                el('strong', '', [`${instrument.symbol} · ${instrument.name}`]),
                el('small', '', [`${positionMeta}${radarMeta}`])
            ]),
            el('strong', 'patrimony-asset-value-v1', [formatBRL(item?.marketValue ?? ZERO_CENTS)]),
            el('span', 'patrimony-asset-chevron-v1', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(instrument.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
function renderNewInvestmentRoute(context, actions) {
    const symbol = accountInputFieldV0('Código do ativo');
    symbol.input.autocapitalize = 'characters';
    symbol.input.placeholder = 'Ex.: PETR4';
    const name = accountInputFieldV0('Nome');
    name.input.placeholder = 'Ex.: Petrobras';
    const assetClass = accountChoiceFieldV0('Tipo', INVESTMENT_CLASSES, 'stock');
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar investimento']);
    save.type = 'submit';
    const form = el('form', 'account-form-v0', [
        symbol.element,
        name.element,
        assetClass.element,
        el('p', 'patrimony-form-support-v1', ['Nesta etapa, o cadastro usa B3 e valores em reais. Mercado internacional e câmbio entram em uma etapa própria.']),
        error.element,
        save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        void createInvestmentInstrument(context.repositories.investmentInstruments, {
            profileId: context.profile.id,
            symbol: symbol.input.value,
            name: name.input.value,
            assetClass: assetClass.control.value,
            venue: 'B3',
            currency: 'BRL'
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => {
                save.disabled = false;
                error.show(failure instanceof Error ? failure.message : 'Não foi possível cadastrar o investimento.');
            });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
async function renderInvestmentDetailRoute(context, instrumentId, actions) {
    const { instrument, position, portfolioItem } = await investmentContext(context, instrumentId);
    const currentValue = portfolioItem?.marketValue ?? position.costBasis;
    const result = addCents(position.realizedGainLoss ?? ZERO_CENTS, portfolioItem?.unrealizedGainLoss ?? ZERO_CENTS);
    const radar = await radarForInstrument(context, instrument);
    const root = el('div', 'patrimony-asset-detail-v1');
    root.append(el('section', 'patrimony-asset-hero-v1', [
        el('small', '', ['VALOR ATUAL']),
        el('strong', '', [formatBRL(currentValue)]),
        el('span', '', [`${instrument.symbol} · ${instrument.name}`])
    ]));
    root.append(el('dl', 'patrimony-asset-detail-list-v1', [
        detailRow('Tipo', classLabel(instrument.assetClass)),
        detailRow('Quantidade', formatQuantity(position.quantity)),
        detailRow('Custo da posição', formatBRL(position.costBasis)),
        detailRow('Resultado', formatBRL(result)),
        detailRow('Base do valor', portfolioItem?.valuationBasis === 'market' ? 'Cotação' : 'Custo')
    ]));
    const actionsBox = el('section', 'patrimony-asset-actions-v1');
    const buy = el('button', 'account-primary-action-v0', ['Registrar compra']);
    buy.type = 'button';
    buy.addEventListener('click', () => actions.onTrade('buy'));
    const sell = el('button', 'account-secondary-action-v0', ['Registrar venda']);
    sell.type = 'button';
    sell.disabled = position.quantity <= 0;
    sell.addEventListener('click', () => actions.onTrade('sell'));
    actionsBox.append(buy, sell);
    root.append(actionsBox);
    if (position.quantity <= 0)
        root.append(el('p', 'patrimony-note-v1', ['Registre uma compra para iniciar a posição.']));

    const radarSection = el('section', 'patrimony-section-v1', [el('h2', 'patrimony-section-title-v1', ['Radar'])]);
    if (!radarSupported(instrument)) {
        radarSection.append(el('div', 'patrimony-empty-v1', [instrument.assetClass === 'reit'
            ? 'Este FII não será pontuado pela régua de ações. A análise específica de FIIs entra na próxima etapa.'
            : 'A análise automática ainda não está habilitada para esta classe de ativo.']));
    }
    else if (radar.kind === 'missing') {
        radarSection.append(el('div', 'patrimony-empty-v1', ['Ainda não há fundamentos para este ativo. Se o gateway estiver configurado, eles serão atualizados automaticamente; você também pode inserir os dados recebidos no briefing.']));
    }
    else if (radar.kind === 'assessment') {
        const assessment = radar.assessment;
        radarSection.append(el('dl', 'patrimony-asset-detail-list-v1', [
            detailRow('Sinal', radar.recommendation),
            detailRow('Score', assessment.scorePercent == null ? 'Dados insuficientes' : `${assessment.scorePercent}%`),
            detailRow('Critérios avaliados', `${assessment.coverage}/${assessment.expectedCriteria}`),
            detailRow('Origem', radar.snapshot.providerId === 'manual' ? 'Briefing / inserido no Orion' : radar.snapshot.providerId),
            detailRow('Período', radar.snapshot.metrics?.[0]?.referencePeriod ?? 'Não informado')
        ]));
        const dividendYield = metricValue(radar.snapshot, 'dividend_yield_pct');
        if (dividendYield)
            radarSection.append(el('p', 'patrimony-note-v1', [`Dividend Yield informado: ${dividendYield}. Ele é exibido, mas não aumenta sozinho o score, evitando premiar yield alto sem contexto.`]));
        const criteriaList = el('div', 'patrimony-assets-list-v1');
        for (const criterion of assessment.criteria) {
            const value = `${criterion.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${criterion.unit === 'percent' ? '%' : ''}`;
            const state = criterion.status === 'positive' ? 'Favorável' : criterion.status === 'neutral' ? 'Neutro' : 'Atenção';
            criteriaList.append(el('div', 'patrimony-asset-history-row-v1', [
                el('span', '', [el('strong', '', [criterion.label]), el('small', '', [`${value} · ${criterion.explanation}`])]),
                el('strong', '', [state])
            ]));
        }
        radarSection.append(criteriaList);
    }
    if (radarSupported(instrument)) {
        const toggle = el('button', 'account-secondary-action-v0', [radar.kind === 'assessment' ? 'Atualizar dados do briefing' : 'Inserir dados do briefing']);
        toggle.type = 'button';
        const reference = accountInputFieldV0('Período de referência');
        reference.input.placeholder = 'Ex.: 3T26 ou 2026';
        const fields = RADAR_METRICS.map(([key, label]) => {
            const field = accountInputFieldV0(label);
            field.input.inputMode = 'decimal';
            return { key, field };
        });
        const error = accountErrorV0();
        const save = el('button', 'account-primary-action-v0', ['Salvar fundamentos']);
        save.type = 'submit';
        const form = el('form', 'account-form-v0', [
            reference.element,
            ...fields.map((item) => item.field.element),
            el('p', 'patrimony-form-support-v1', ['Preencha apenas os indicadores que o briefing trouxer. O Orion recalcula o Radar a partir deles e mantém a origem separada das operações da carteira.']),
            error.element,
            save
        ]);
        form.hidden = true;
        toggle.addEventListener('click', () => {
            form.hidden = !form.hidden;
            if (!form.hidden)
                reference.input.focus();
        });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            error.clear();
            save.disabled = true;
            const values = Object.fromEntries(fields.map((item) => [item.key, item.field.input.value]));
            void saveManualFundamentals(context.repositories.marketDataCache, instrument, {
                referencePeriod: reference.input.value,
                values
            }).then(actions.onDataChanged)
                .catch((failure) => {
                    save.disabled = false;
                    error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar os fundamentos.');
                });
        });
        radarSection.append(toggle, form, el('p', 'patrimony-note-v1', ['Sinal do Radar não é uma ordem automática de compra. A decisão final continua separada do registro da operação.']));
    }
    root.append(radarSection);
    return root;
}
async function renderInvestmentTradeRoute(context, instrumentId, side, actions) {
    const { instrument, position } = await investmentContext(context, instrumentId);
    const accounts = (await context.repositories.accounts.listByProfile(context.profile.id)).filter((item) => item.active);
    const quantity = accountInputFieldV0('Quantidade');
    quantity.input.inputMode = 'decimal';
    quantity.input.placeholder = 'Ex.: 10';
    const gross = accountMoneyFieldV0(side === 'buy' ? 'Valor bruto da compra' : 'Valor bruto da venda');
    const fees = accountMoneyFieldV0('Taxas');
    fees.input.value = '0,00';
    const account = accountChoiceFieldV0('Conta de liquidação', accounts.map((item) => ({ value: item.id, label: item.name })), '');
    const date = dateField('Data', todayISO());
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', [side === 'buy' ? 'Registrar compra' : 'Registrar venda']);
    save.type = 'submit';
    const support = side === 'buy'
        ? 'A compra reduz o saldo da conta escolhida pelo valor bruto mais as taxas.'
        : `Posição disponível: ${formatQuantity(position.quantity)} un. A venda devolve à conta o valor líquido das taxas.`;
    const form = el('form', 'account-form-v0', [
        el('div', 'account-static-field-v0', [
            el('span', 'account-field-label-v0', ['Investimento']),
            el('strong', '', [`${instrument.symbol} · ${instrument.name}`])
        ]),
        quantity.element,
        gross.element,
        fees.element,
        account.element,
        date.element,
        el('p', 'patrimony-form-support-v1', [support]),
        error.element,
        save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        if (!account.control.value) {
            error.show('Escolha a conta de liquidação.');
            return;
        }
        save.disabled = true;
        void recordInvestmentTrade(
            context.repositories.investmentTrades,
            context.repositories.investmentInstruments,
            context.repositories.accounts,
            context.repositories.transactions,
            {
                profileId: context.profile.id,
                instrumentId: instrument.id,
                settlementAccountId: account.control.value,
                side,
                quantity: quantity.input.value,
                grossAmount: gross.input.value,
                fees: fees.input.value,
                date: date.input.value
            }
        ).then(() => actions.onCompleted(instrument.id))
            .catch((failure) => {
                save.disabled = false;
                error.show(failure instanceof Error ? failure.message : 'Não foi possível registrar a operação.');
            });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}

export async function renderSummaryRoute(state, repositories, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if ((state.route === 'patrimony-asset-detail' || state.route === 'patrimony-asset-edit' || state.route === 'patrimony-asset-value') && !state.selectedAssetId)
        state.route = 'patrimony-assets';
    if ((state.route === 'patrimony-investment-detail' || state.route === 'patrimony-investment-trade') && !state.selectedInvestmentId)
        state.route = 'patrimony-investments';
    if (state.route === 'patrimony-investment-trade' && state.selectedInvestmentSide !== 'buy' && state.selectedInvestmentSide !== 'sell')
        state.route = 'patrimony-investment-detail';
    const context = { repositories, profile: state.profile, lifecycle: assetLifecycle };
    if (state.route === 'summary') {
        return renderHomeV0(repositories, state.profile, {
            onOpenMovements: () => { state.route = 'movements'; rerender(); },
            onOpenPatrimony: () => { state.route = 'patrimony'; rerender(); }
        });
    }
    if (state.route === 'patrimony') {
        return renderPatrimonyRoute(repositories, state.profile, {
            onManageAssets: () => { state.route = 'patrimony-assets'; rerender(); },
            onOpenInvestments: () => { state.route = 'patrimony-investments'; rerender(); }
        });
    }
    if (state.route === 'patrimony-investments') {
        return renderInvestmentsRoute(context, {
            onCreate: () => { state.route = 'patrimony-investment-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedInvestmentId = id; state.route = 'patrimony-investment-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-investment-new') {
        return renderNewInvestmentRoute(context, {
            onSaved: (id) => { state.selectedInvestmentId = id; state.route = 'patrimony-investment-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-investment-detail') {
        return renderInvestmentDetailRoute(context, state.selectedInvestmentId, {
            onTrade: (side) => { state.selectedInvestmentSide = side; state.route = 'patrimony-investment-trade'; rerender(); },
            onDataChanged: rerender
        });
    }
    if (state.route === 'patrimony-investment-trade') {
        return renderInvestmentTradeRoute(context, state.selectedInvestmentId, state.selectedInvestmentSide, {
            onCompleted: () => { state.route = 'patrimony-investment-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-assets') {
        return renderAssetListV1(context, {
            onCreate: () => { state.route = 'patrimony-asset-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedAssetId = id; state.route = 'patrimony-asset-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-asset-new') {
        return renderNewAssetV1(context, {
            onSaved: (id) => { state.selectedAssetId = id; state.route = 'patrimony-asset-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-asset-detail') {
        return renderAssetDetailV1(context, state.selectedAssetId, {
            onEdit: () => { state.route = 'patrimony-asset-edit'; rerender(); },
            onUpdateValue: () => { state.route = 'patrimony-asset-value'; rerender(); },
            onDeactivated: () => { state.selectedAssetId = null; state.route = 'patrimony-assets'; rerender(); }
        });
    }
    if (state.route === 'patrimony-asset-edit') {
        return renderEditAssetV1(context, state.selectedAssetId, {
            onSaved: () => { state.route = 'patrimony-asset-detail'; rerender(); }
        });
    }
    return renderAssetValueV1(context, state.selectedAssetId, {
        onCompleted: () => { state.route = 'patrimony-asset-detail'; rerender(); }
    });
}
