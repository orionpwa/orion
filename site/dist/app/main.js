import { APP_VERSION } from './version.js';
import { loadRuntimeConfig } from '../config/runtime.js';
import { IndexedDbAccountRepository, IndexedDbAllocationRepository, IndexedDbAssetRepository, IndexedDbCreditCardRepository, IndexedDbDebtRepository, IndexedDbProfileRepository, IndexedDbRecurrenceMonthRepository, IndexedDbRecurrenceRepository, IndexedDbTransactionRepository, IndexedDbInvestmentInstrumentRepository, IndexedDbInvestmentTradeRepository } from '../data/indexeddb/repositories.js';
import { IndexedDbTransactionMutationGateway } from '../data/indexeddb/transaction-mutations.js';
import { IndexedDbEntityLifecycleMutationGateway } from '../data/indexeddb/entity-lifecycle-mutations.js';
import { IndexedDbMarketDataCache } from '../data/indexeddb/market-cache.js';
import { IndexedDbMetadataRepository } from '../data/indexeddb/metadata.js';
import { clear } from '../presentation/dom.js';
import { createShellV0 } from '../presentation/shell.js';
import { renderHomeV0 } from '../presentation/home.js';
import { DEFAULT_MOVEMENT_FILTERS_V0, renderMovementDetailV0, renderMovementFiltersV0, renderMovementListV0, renderNewMovementV0, renderEditMovementV0 } from '../presentation/movements.js';
import { renderPlanningRootV0, renderCommitmentListV0, renderCommitmentDetailV0, renderNewCommitmentV0, renderEditCommitmentV0, renderCommitmentPaymentV0, renderDebtListV0, renderDebtDetailV0, renderNewDebtV0, renderEditDebtV0, renderDebtPaymentV0, renderAllocationListV0, renderAllocationDetailV0, renderNewAllocationV0, renderEditAllocationV0, renderAdjustAllocationV0 } from '../presentation/planning.js';
import { renderAccountsRootV0, renderAccountDetailV0, renderNewAccountV0, renderEditAccountV0 } from '../presentation/accounts.js';
import { renderSettingsRootV0, renderSettingsProfileV0, renderSettingsDataV0, renderSettingsPrivacyV0, renderSettingsAboutV0, renderSettingsRestartV0 } from '../presentation/settings.js';
import { showOnboarding } from '../presentation/screens/onboarding.js';
import { showToast, showUpdateBanner } from '../presentation/components/feedback.js';
import { bindConnectivityStatus } from '../presentation/components/system-status.js';
import { errorState, fatalState, loadingState } from '../presentation/components/states.js';
import { recordDiagnostic } from '../diagnostics/session-log.js';
import { LocalIdentityProvider } from '../identity/session.js';
import { WebPlatformRuntime } from '../platform/web-runtime.js';
import { registerPwaUpdateFlow } from '../platform/pwa-update.js';
import { HttpMarketGatewayProvider } from '../infrastructure/market-data/http-gateway-provider.js';
import { checkGatewayHealth } from '../infrastructure/market-data/gateway-health.js';
import { ResilientMarketDataGateway } from '../application/market-data/resilient-gateway.js';
import { MarketRefreshCoordinator } from '../application/market-data/refresh-coordinator.js';
import { FundamentalRefreshCoordinator } from '../application/market-data/fundamental-refresh-coordinator.js';
const platformRuntime = new WebPlatformRuntime();
const marketDataCache = new IndexedDbMarketDataCache();
document.documentElement.classList.toggle('pwa-standalone', platformRuntime.isStandalone());
const repositories = {
    profiles: new IndexedDbProfileRepository(),
    accounts: new IndexedDbAccountRepository(),
    transactions: new IndexedDbTransactionRepository(),
    creditCards: new IndexedDbCreditCardRepository(),
    debts: new IndexedDbDebtRepository(),
    assets: new IndexedDbAssetRepository(),
    allocations: new IndexedDbAllocationRepository(),
    recurrences: new IndexedDbRecurrenceRepository(),
    recurrenceMonths: new IndexedDbRecurrenceMonthRepository(),
    investmentInstruments: new IndexedDbInvestmentInstrumentRepository(),
    investmentTrades: new IndexedDbInvestmentTradeRepository(),
    marketDataCache
};
const transactionMutations = new IndexedDbTransactionMutationGateway();
const entityLifecycle = new IndexedDbEntityLifecycleMutationGateway();
const identityProvider = new LocalIdentityProvider(repositories);
async function start() {
    const host = document.querySelector('#app');
    if (!host)
        throw new Error('Elemento raiz do aplicativo não encontrado.');
    host.replaceChildren(loadingState());
    bindConnectivityStatus();
    const runtimeConfigPromise = loadRuntimeConfig();
    const session = await identityProvider.getSession();
    let profile = session.profile;
    let route = 'summary';
    let selectedMovementId = null;
    let movementFilters = { ...DEFAULT_MOVEMENT_FILTERS_V0 };
    let selectedCommitmentId = null;
    let selectedDebtId = null;
    let selectedAllocationId = null;
    let selectedAccountId = null;
    let rendering = false;
    let marketCoordinator = null;
    let fundamentalCoordinator = null;
    const shell = createShellV0((next) => { route = next; void render(); }, () => { route = 'movement-new'; void render(); });
    host.replaceChildren(shell.shell);
    const applyProfile = (next) => {
        profile = next;
        void render();
    };
    async function render() {
        if (rendering)
            return;
        rendering = true;
        if ((route === 'movement-detail' || route === 'movement-edit') && !selectedMovementId)
            route = 'movements';
        if ((route === 'planning-commitment-detail' || route === 'planning-commitment-edit' || route === 'planning-commitment-payment') && !selectedCommitmentId)
            route = 'planning-commitments';
        if ((route === 'planning-debt-detail' || route === 'planning-debt-edit' || route === 'planning-debt-payment') && !selectedDebtId)
            route = 'planning-debts';
        if ((route === 'planning-allocation-detail' || route === 'planning-allocation-edit' || route === 'planning-allocation-adjust') && !selectedAllocationId)
            route = 'planning-allocations';
        if ((route === 'account-detail' || route === 'account-edit') && !selectedAccountId)
            route = 'accounts';
        shell.setActiveRoute(route);
        try {
            let screen;
            if (route === 'summary') {
                screen = await renderHomeV0(repositories, profile, {
                    onOpenMovements: () => { route = 'movements'; void render(); }
                });
            }
            else if (route === 'movements') {
                screen = await renderMovementListV0(repositories, profile, movementFilters, {
                    onOpenDetail: (transactionId) => {
                        selectedMovementId = transactionId;
                        route = 'movement-detail';
                        void render();
                    },
                    onOpenFilters: () => { route = 'movement-filters'; void render(); },
                    onClearFilters: () => {
                        movementFilters = { ...DEFAULT_MOVEMENT_FILTERS_V0 };
                        void render();
                    }
                });
            }
            else if (route === 'movement-new') {
                screen = await renderNewMovementV0(repositories, profile, {
                    onSaved: (transaction) => {
                        selectedMovementId = transaction.id;
                        route = 'movement-detail';
                        void render();
                    }
                });
            }
            else if (route === 'movement-detail') {
                screen = await renderMovementDetailV0(repositories, profile, transactionMutations, selectedMovementId, {
                    onEdit: () => { route = 'movement-edit'; void render(); },
                    onDeleted: () => {
                        selectedMovementId = null;
                        route = 'movements';
                        void render();
                    },
                    onRestored: () => { void render(); }
                });
            }
            else if (route === 'movement-edit') {
                screen = await renderEditMovementV0(repositories, profile, transactionMutations, selectedMovementId, {
                    onSaved: () => { route = 'movement-detail'; void render(); },
                    onUnavailable: () => {
                        setTimeout(() => {
                            selectedMovementId = null;
                            route = 'movements';
                            void render();
                        }, 0);
                    }
                });
            }
            else if (route === 'movement-filters') {
                screen = await renderMovementFiltersV0(repositories, profile, movementFilters, {
                    onApply: (next) => {
                        movementFilters = next;
                        route = 'movements';
                        void render();
                    }
                });
            }
            else if (route === 'planning') {
                screen = await renderPlanningRootV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onOpenCommitments: () => { route = 'planning-commitments'; void render(); },
                    onOpenDebts: () => { route = 'planning-debts'; void render(); },
                    onOpenAllocations: () => { route = 'planning-allocations'; void render(); }
                });
            }
            else if (route === 'planning-commitments') {
                screen = await renderCommitmentListV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onCreate: () => { route = 'planning-commitment-new'; void render(); },
                    onOpenDetail: (id) => { selectedCommitmentId = id; route = 'planning-commitment-detail'; void render(); }
                });
            }
            else if (route === 'planning-commitment-new') {
                screen = await renderNewCommitmentV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onSaved: (id) => { selectedCommitmentId = id; route = 'planning-commitment-detail'; void render(); }
                });
            }
            else if (route === 'planning-commitment-detail') {
                screen = await renderCommitmentDetailV0({ repositories, profile, lifecycle: entityLifecycle }, selectedCommitmentId, {
                    onEdit: () => { route = 'planning-commitment-edit'; void render(); },
                    onPayment: () => { route = 'planning-commitment-payment'; void render(); },
                    onChanged: () => { void render(); },
                    onDeactivated: () => { selectedCommitmentId = null; route = 'planning-commitments'; void render(); }
                });
            }
            else if (route === 'planning-commitment-edit') {
                screen = await renderEditCommitmentV0({ repositories, profile, lifecycle: entityLifecycle }, selectedCommitmentId, {
                    onSaved: () => { route = 'planning-commitment-detail'; void render(); }
                });
            }
            else if (route === 'planning-commitment-payment') {
                screen = await renderCommitmentPaymentV0({ repositories, profile, lifecycle: entityLifecycle }, selectedCommitmentId, {
                    onCompleted: () => { route = 'planning-commitment-detail'; void render(); }
                });
            }
            else if (route === 'planning-debts') {
                screen = await renderDebtListV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onCreate: () => { route = 'planning-debt-new'; void render(); },
                    onOpenDetail: (id) => { selectedDebtId = id; route = 'planning-debt-detail'; void render(); }
                });
            }
            else if (route === 'planning-debt-new') {
                screen = renderNewDebtV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onSaved: (id) => { selectedDebtId = id; route = 'planning-debt-detail'; void render(); }
                });
            }
            else if (route === 'planning-debt-detail') {
                screen = await renderDebtDetailV0({ repositories, profile, lifecycle: entityLifecycle }, selectedDebtId, {
                    onEdit: () => { route = 'planning-debt-edit'; void render(); },
                    onPayment: () => { route = 'planning-debt-payment'; void render(); },
                    onDeactivated: () => { selectedDebtId = null; route = 'planning-debts'; void render(); }
                });
            }
            else if (route === 'planning-debt-edit') {
                screen = await renderEditDebtV0({ repositories, profile, lifecycle: entityLifecycle }, selectedDebtId, {
                    onSaved: () => { route = 'planning-debt-detail'; void render(); }
                });
            }
            else if (route === 'planning-debt-payment') {
                screen = await renderDebtPaymentV0({ repositories, profile, lifecycle: entityLifecycle }, selectedDebtId, {
                    onCompleted: () => { route = 'planning-debt-detail'; void render(); }
                });
            }
            else if (route === 'planning-allocations') {
                screen = await renderAllocationListV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onCreate: () => { route = 'planning-allocation-new'; void render(); },
                    onOpenDetail: (id) => { selectedAllocationId = id; route = 'planning-allocation-detail'; void render(); }
                });
            }
            else if (route === 'planning-allocation-new') {
                screen = await renderNewAllocationV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onSaved: (id) => { selectedAllocationId = id; route = 'planning-allocation-detail'; void render(); }
                });
            }
            else if (route === 'planning-allocation-detail') {
                screen = await renderAllocationDetailV0({ repositories, profile, lifecycle: entityLifecycle }, selectedAllocationId, {
                    onEdit: () => { route = 'planning-allocation-edit'; void render(); },
                    onAdjust: () => { route = 'planning-allocation-adjust'; void render(); },
                    onDeactivated: () => { selectedAllocationId = null; route = 'planning-allocations'; void render(); }
                });
            }
            else if (route === 'planning-allocation-edit') {
                screen = await renderEditAllocationV0({ repositories, profile, lifecycle: entityLifecycle }, selectedAllocationId, {
                    onSaved: () => { route = 'planning-allocation-detail'; void render(); }
                });
            }
            else if (route === 'planning-allocation-adjust') {
                screen = await renderAdjustAllocationV0({ repositories, profile, lifecycle: entityLifecycle }, selectedAllocationId, {
                    onCompleted: () => { route = 'planning-allocation-detail'; void render(); }
                });
            }
            else if (route === 'accounts') {
                screen = await renderAccountsRootV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onCreate: () => { route = 'account-new'; void render(); },
                    onOpenDetail: (id) => { selectedAccountId = id; route = 'account-detail'; void render(); }
                });
            }
            else if (route === 'account-new') {
                screen = renderNewAccountV0({ repositories, profile, lifecycle: entityLifecycle }, {
                    onSaved: (id) => { selectedAccountId = id; route = 'account-detail'; void render(); }
                });
            }
            else if (route === 'account-detail') {
                screen = await renderAccountDetailV0({ repositories, profile, lifecycle: entityLifecycle }, selectedAccountId, {
                    onEdit: () => { route = 'account-edit'; void render(); },
                    onDeactivated: () => { selectedAccountId = null; route = 'accounts'; void render(); },
                    onOpenMovement: (id) => { selectedMovementId = id; route = 'movement-detail'; void render(); },
                    onViewAllMovements: () => {
                        movementFilters = { ...DEFAULT_MOVEMENT_FILTERS_V0, accountId: selectedAccountId };
                        route = 'movements';
                        void render();
                    }
                });
            }
            else if (route === 'account-edit') {
                screen = await renderEditAccountV0({ repositories, profile, lifecycle: entityLifecycle }, selectedAccountId, {
                    onSaved: () => { route = 'account-detail'; void render(); }
                });
            }
            else if (route === 'settings') {
                screen = renderSettingsRootV0(profile.displayName, {
                    onProfile: () => { route = 'settings-profile'; void render(); },
                    onData: () => { route = 'settings-data'; void render(); },
                    onPrivacy: () => { route = 'settings-privacy'; void render(); },
                    onAbout: () => { route = 'settings-about'; void render(); },
                    onRestart: () => { route = 'settings-restart'; void render(); }
                });
            }
            else if (route === 'settings-profile') {
                screen = renderSettingsProfileV0({ repositories, profile, onProfileChanged: applyProfile, onDataChanged: () => void render() }, () => {
                    route = 'settings';
                    void render();
                });
            }
            else if (route === 'settings-data') {
                screen = renderSettingsDataV0({ repositories, profile, onProfileChanged: applyProfile, onDataChanged: () => void render() });
            }
            else if (route === 'settings-privacy') {
                screen = renderSettingsPrivacyV0();
            }
            else if (route === 'settings-about') {
                screen = renderSettingsAboutV0();
            }
            else {
                screen = renderSettingsRestartV0({ repositories, profile, onProfileChanged: applyProfile, onDataChanged: () => void render() });
            }
            clear(shell.content);
            shell.content.append(screen);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido.';
            recordDiagnostic('SCREEN_RENDER', 'error');
            clear(shell.content);
            shell.content.append(errorState('Não foi possível carregar esta área.', message, () => void render()));
        }
        finally {
            rendering = false;
        }
    }
    await render();
    if (!profile.onboardingCompletedAt) {
        showOnboarding(repositories, profile, { onComplete: applyProfile, onDataChanged: () => void render() });
    }
    const runtimeConfig = await runtimeConfigPromise;
    if (runtimeConfig.marketGatewayUrl) {
        const health = await checkGatewayHealth(runtimeConfig.marketGatewayUrl);
        recordDiagnostic('MARKET_GATEWAY_HEALTH', health.status === 'healthy' ? 'info' : 'warning', { status: health.status });
        const remoteProvider = new HttpMarketGatewayProvider(runtimeConfig.marketGatewayUrl);
        const marketGateway = new ResilientMarketDataGateway([remoteProvider], marketDataCache, {
            quoteMaxAgeMs: 36 * 60 * 60 * 1000,
            fundamentalsMaxAgeMs: 7 * 24 * 60 * 60 * 1000
        });
        const metadata = new IndexedDbMetadataRepository();
        marketCoordinator = new MarketRefreshCoordinator(repositories.investmentInstruments, marketGateway, metadata, platformRuntime, profile.id, { maxAgeMs: 24 * 60 * 60 * 1000 });
        fundamentalCoordinator = new FundamentalRefreshCoordinator(repositories.investmentInstruments, marketGateway, metadata, platformRuntime, profile.id, { maxAgeMs: 72 * 60 * 60 * 1000 });
        marketCoordinator.bindLifecycle();
        fundamentalCoordinator.bindLifecycle();
        void marketCoordinator.refreshIfDue().then((result) => {
            if (result)
                recordDiagnostic('MARKET_REFRESH', 'info', { fresh: result.fresh, cached: result.cached, unavailable: result.unavailable });
        }).catch(() => recordDiagnostic('MARKET_REFRESH_FAILED', 'warning'));
        void fundamentalCoordinator.refreshIfDue().then((result) => {
            if (result)
                recordDiagnostic('FUNDAMENTAL_REFRESH', 'info', { fresh: result.fresh, cached: result.cached, unsupported: result.unsupported, unavailable: result.unavailable });
        }).catch(() => recordDiagnostic('FUNDAMENTAL_REFRESH_FAILED', 'warning'));
    }
    const registration = await registerPwaUpdateFlow({
        onUpdateReady: (applyUpdate) => showUpdateBanner('Atualizar', applyUpdate),
        onError: () => {
            recordDiagnostic('PWA_SW_REGISTER', 'warning');
            showToast('Offline indisponível nesta sessão.', 'error');
        }
    });
    if (registration)
        platformRuntime.onResume(() => { void registration.update().catch(() => undefined); });
    document.documentElement.dataset.orionVersion = APP_VERSION;
}
window.addEventListener('unhandledrejection', () => {
    recordDiagnostic('UNHANDLED_REJECTION', 'error');
});
window.addEventListener('error', () => recordDiagnostic('WINDOW_ERROR', 'error'));
void start().catch((error) => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    recordDiagnostic('APP_BOOT', 'error');
    const host = document.querySelector('#app');
    if (host)
        host.replaceChildren(fatalState(message));
});
