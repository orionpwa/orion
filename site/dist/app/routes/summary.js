import { allocationBasisPoints, basisPointsToPercent, getPortfolioSnapshot, totalPortfolioPerformance } from '../../application/investments/portfolio.js';
import { IndexedDbEntityLifecycleMutationGateway } from '../../data/indexeddb/entity-lifecycle-mutations.js';
import { formatQuantity } from '../../domain/investments/quantity.js';
import { formatBRL } from '../../domain/money/money.js';
import { el } from '../../presentation/dom.js';
import { renderHomeV0 } from '../../presentation/home.js';
import { renderAssetDetailV1, renderAssetListV1, renderAssetValueV1, renderEditAssetV1, renderNewAssetV1, renderPatrimonyV1 } from '../../presentation/screens/patrimony-v1.js';

const ROUTES = new Set([
    'summary',
    'patrimony',
    'patrimony-investments',
    'patrimony-assets',
    'patrimony-asset-new',
    'patrimony-asset-detail',
    'patrimony-asset-edit',
    'patrimony-asset-value'
]);
const assetLifecycle = new IndexedDbEntityLifecycleMutationGateway();

function valueRow(label, value) {
    return el('div', 'patrimony-row-v1', [
        el('span', 'patrimony-row-label-v1', [label]),
        el('strong', 'patrimony-row-value-v1', [formatBRL(value)])
    ]);
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

async function renderInvestmentsRoute(repositories, profile) {
    const snapshot = await getPortfolioSnapshot(repositories, repositories.marketDataCache, profile.id);
    const root = el('div', 'patrimony-screen-v1');

    if (snapshot.items.length === 0) {
        root.append(
            el('section', 'patrimony-section-v1', [
                el('h2', 'patrimony-section-title-v1', ['Carteira']),
                el('div', 'patrimony-empty-v1', ['Nenhuma posição de investimento registrada.'])
            ]),
            el('p', 'patrimony-note-v1', ['Nesta etapa, Investimentos é somente leitura. Cadastro e compra ou venda serão liberados separadamente.'])
        );
        return root;
    }

    const performance = totalPortfolioPerformance(snapshot);
    root.append(el('section', 'patrimony-hero-v1', [
        el('span', 'patrimony-kicker-v1', ['VALOR DA CARTEIRA']),
        el('strong', 'patrimony-net-v1', [formatBRL(snapshot.marketValue)]),
        el('div', 'patrimony-totals-v1', [
            valueRow('Custo', snapshot.costBasis),
            valueRow('Resultado', performance)
        ])
    ]));

    if (snapshot.missingQuotes > 0 || snapshot.staleQuotes > 0) {
        const notes = [];
        if (snapshot.missingQuotes > 0)
            notes.push(`${snapshot.missingQuotes} posição(ões) sem cotação e mostrada(s) pelo custo`);
        if (snapshot.staleQuotes > 0)
            notes.push(`${snapshot.staleQuotes} cotação(ões) desatualizada(s)`);
        root.append(el('p', 'patrimony-note-v1', [notes.join('. ') + '.']));
    }

    const positions = el('section', 'patrimony-section-v1', [
        el('h2', 'patrimony-section-title-v1', ['Posições'])
    ]);
    for (const item of snapshot.items) {
        const allocation = basisPointsToPercent(allocationBasisPoints(item, snapshot.marketValue));
        const basis = item.valuationBasis === 'market' ? 'cotação' : 'custo';
        const label = `${item.instrument.symbol} · ${item.instrument.name} · ${formatQuantity(item.position.quantity)} un. · ${basis} · ${allocation}`;
        positions.append(valueRow(label, item.marketValue));
    }
    root.append(
        positions,
        el('p', 'patrimony-note-v1', ['Esta tela apenas apresenta a carteira já registrada. Nenhuma operação é criada aqui.'])
    );
    return root;
}

export async function renderSummaryRoute(state, repositories, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if ((state.route === 'patrimony-asset-detail' || state.route === 'patrimony-asset-edit' || state.route === 'patrimony-asset-value') && !state.selectedAssetId)
        state.route = 'patrimony-assets';
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
    if (state.route === 'patrimony-investments')
        return renderInvestmentsRoute(repositories, state.profile);
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
