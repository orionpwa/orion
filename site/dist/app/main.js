import { APP_VERSION } from './version.js';
import { loadRuntimeConfig } from '../config/runtime.js';
import { IndexedDbAccountRepository, IndexedDbAllocationRepository, IndexedDbAssetRepository, IndexedDbCreditCardRepository, IndexedDbDebtRepository, IndexedDbProfileRepository, IndexedDbRecurrenceMonthRepository, IndexedDbRecurrenceRepository, IndexedDbTransactionRepository, IndexedDbInvestmentInstrumentRepository, IndexedDbInvestmentTradeRepository } from '../data/indexeddb/repositories.js';
import { IndexedDbTransactionMutationGateway } from '../data/indexeddb/transaction-mutations.js';
import { IndexedDbEntityLifecycleMutationGateway } from '../data/indexeddb/entity-lifecycle-mutations.js';
import { IndexedDbMarketDataCache } from '../data/indexeddb/market-cache.js';
import { IndexedDbMetadataRepository } from '../data/indexeddb/metadata.js';
import { clear } from '../presentation/dom.js';
import { createShellV0 } from '../presentation/shell.js';
import { initializeAppearanceClock } from '../presentation/appearance.js';
import { renderHomeV3 } from '../presentation/home.js';
import { renderMovementsV3 } from '../presentation/movements.js';
import { renderPlanningV3 } from '../presentation/planning.js';
import { renderAccountsV3 } from '../presentation/accounts.js';
import { renderSettingsV3 } from '../presentation/settings.js';
import { showOnboarding } from '../presentation/screens/onboarding.js';
import { openNewTransactionSheet } from '../presentation/screens/new-transaction.js';
import { showActionToast, showToast } from '../presentation/components/feedback.js';
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
initializeAppearanceClock();
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
    let rendering = false;
    let marketCoordinator = null;
    let fundamentalCoordinator = null;
    const shell = createShellV0((next) => { route = next; void render(); }, () => {
        void openNewTransactionSheet(repositories, profile, () => void render());
    });
    host.replaceChildren(shell.shell);
    const applyProfile = (next) => {
        profile = next;
        void render();
    };
    async function render() {
        if (rendering)
            return;
        rendering = true;
        shell.setActiveRoute(route);
        try {
            let screen;
            if (route === 'summary')
                screen = await renderHomeV3(repositories, profile, { onOpenMovements: () => { route = 'movements'; void render(); } });
            else if (route === 'movements')
                screen = await renderMovementsV3(repositories, profile, transactionMutations, () => void render());
            else if (route === 'planning')
                screen = await renderPlanningV3(repositories, profile, entityLifecycle, () => void render());
            else if (route === 'accounts')
                screen = await renderAccountsV3(repositories, profile, entityLifecycle, () => void render());
            else
                screen = await renderSettingsV3(repositories, profile, applyProfile, () => void render());
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
        onUpdateReady: (applyUpdate) => showActionToast('Uma atualização do Orion está pronta.', 'Atualizar', applyUpdate),
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
