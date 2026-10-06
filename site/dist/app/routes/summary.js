import { createInvestmentInstrument } from '../../application/investments/create-instrument.js';
import { allocationBasisPoints, basisPointsToPercent, getPortfolioSnapshot, totalPortfolioPerformance } from '../../application/investments/portfolio.js';
import { recordInvestmentTrade } from '../../application/investments/record-trade.js';
import { IndexedDbEntityLifecycleMutationGateway } from '../../data/indexeddb/entity-lifecycle-mutations.js';
import { calculateInvestmentPosition } from '../../domain/investments/position.js';
import { formatQuantity, quantityScaleForInstrument } from '../../domain/investments/quantity.js';
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
    { value: 'crypto', label: 'Criptoativo' },
    { value: 'other', label: 'Outro listado' }
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
            ? `${formatQuantity(item.position.quantity, quantityScaleForInstrument(instrument))} un. · ${item.valuationBasis === 'market' ? 'cotação' : 'custo'}${allocation ? ` · ${allocation}` : ''}`
            : 'Sem posição';
        const row = el('button', 'patrimony-asset-row-v1', [
            el('span', 'patrimony-asset-copy-v1', [
                el('strong', '', [`${instrument.symbol} · ${instrument.name}`]),
                el('small', '', [meta])
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
    symbol.input.placeholder = 'Ex.: PETR4 ou BTC';
    const name = accountInputFieldV0('Nome');
    name.input.placeholder = 'Ex.: Petrobras ou Bitcoin';
    const assetClass = accountChoiceFieldV0('Tipo', INVESTMENT_CLASSES, 'stock');
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar investimento']);
    save.type = 'submit';
    const form = el('form', 'account-form-v0', [
        symbol.element,
        name.element,
        assetClass.element,
        el('p', 'patrimony-form-support-v1', ['Cadastro patrimonial em reais. Ações, BDRs, FIIs e ETFs usam B3; criptoativos usam o mercado cripto. A cotação altera apenas o valor patrimonial.']),
        error.element,
        save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        const selectedClass = assetClass.control.value;
        void createInvestmentInstrument(context.repositories.investmentInstruments, {
            profileId: context.profile.id,
            symbol: symbol.input.value,
            name: name.input.value,
            assetClass: selectedClass,
            venue: selectedClass === 'crypto' ? 'CRYPTO' : 'B3',
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
    const root = el('div', 'patrimony-asset-detail-v1');
    root.append(el('section', 'patrimony-asset-hero-v1', [
        el('small', '', ['VALOR ATUAL']),
        el('strong', '', [formatBRL(currentValue)]),
        el('span', '', [`${instrument.symbol} · ${instrument.name}`])
    ]));
    root.append(el('dl', 'patrimony-asset-detail-list-v1', [
        detailRow('Tipo', classLabel(instrument.assetClass)),
        detailRow('Quantidade', formatQuantity(position.quantity, quantityScaleForInstrument(instrument))),
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
    return root;
}
async function renderInvestmentTradeRoute(context, instrumentId, side, actions) {
    const { instrument, position } = await investmentContext(context, instrumentId);
    const accounts = (await context.repositories.accounts.listByProfile(context.profile.id)).filter((item) => item.active);
    const quantity = accountInputFieldV0('Quantidade');
    quantity.input.inputMode = 'decimal';
    quantity.input.placeholder = instrument.assetClass === 'crypto' ? 'Ex.: 0,00080000' : 'Ex.: 10';
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
        : `Posição disponível: ${formatQuantity(position.quantity, quantityScaleForInstrument(instrument))} un. A venda devolve à conta o valor líquido das taxas.`;
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
            onRefreshQuotes: () => { window.dispatchEvent(new Event('orion:refresh-market')); },
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
            onTrade: (side) => { state.selectedInvestmentSide = side; state.route = 'patrimony-investment-trade'; rerender(); }
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
