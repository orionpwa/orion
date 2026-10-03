const CACHE_NAME = "orion-0-1-0-development-12-32-static-v1";
const STATIC_PATHS = [
  "./",
  "./assets/institutions/bradesco.png",
  "./assets/institutions/caju.png",
  "./assets/institutions/inter.png",
  "./assets/institutions/mercado-pago.png",
  "./assets/orion-icon-rubi-v2-1254.png",
  "./assets/orion-icon-rubi-v2-180.png",
  "./assets/orion-icon-rubi-v2-192.png",
  "./assets/orion-icon-rubi-v2-512.png",
  "./assets/orion-icon-rubi-v2-maskable-512.png",
  "./dist/app/main.js",
  "./dist/app/version.js",
  "./dist/application/accounts/create-account.js",
  "./dist/application/accounts/update-account.js",
  "./dist/application/allocations/create-allocation.js",
  "./dist/application/allocations/update-allocation.js",
  "./dist/application/assets/create-asset.js",
  "./dist/application/assets/record-asset-operation.js",
  "./dist/application/assets/update-asset.js",
  "./dist/application/bootstrap.js",
  "./dist/application/context.js",
  "./dist/application/credit-cards/create-credit-card.js",
  "./dist/application/credit-cards/pay-credit-card.js",
  "./dist/application/credit-cards/record-card-purchase.js",
  "./dist/application/credit-cards/update-credit-card.js",
  "./dist/application/dashboard/financial-status.js",
  "./dist/application/dashboard/get-dashboard.js",
  "./dist/application/debts/create-debt.js",
  "./dist/application/debts/pay-debt.js",
  "./dist/application/debts/update-debt.js",
  "./dist/application/investments/create-instrument.js",
  "./dist/application/investments/manual-fundamentals.js",
  "./dist/application/investments/manual-quote.js",
  "./dist/application/investments/portfolio.js",
  "./dist/application/investments/radar-assessment.js",
  "./dist/application/investments/record-trade.js",
  "./dist/application/lifecycle/deactivate-entity.js",
  "./dist/application/market-data/contracts.js",
  "./dist/application/market-data/fundamental-refresh-coordinator.js",
  "./dist/application/market-data/refresh-coordinator.js",
  "./dist/application/market-data/refresh-fundamentals.js",
  "./dist/application/market-data/refresh-portfolio.js",
  "./dist/application/market-data/resilient-gateway.js",
  "./dist/application/planning/get-financial-position.js",
  "./dist/application/profile/update-profile.js",
  "./dist/application/recurrences/create-recurrence.js",
  "./dist/application/recurrences/payment-link.js",
  "./dist/application/recurrences/update-recurrence-month.js",
  "./dist/application/recurrences/update-recurrence.js",
  "./dist/application/shared/ids.js",
  "./dist/application/shared/validation.js",
  "./dist/application/transactions/create-transaction.js",
  "./dist/application/transactions/mutate-transaction.js",
  "./dist/application/transactions/update-manual-transaction.js",
  "./dist/catalog/account-types.js",
  "./dist/catalog/institutions.js",
  "./dist/config/runtime.js",
  "./dist/data/backup/fresh-profile.js",
  "./dist/data/backup/model.js",
  "./dist/data/backup/profile.js",
  "./dist/data/backup/rebind.js",
  "./dist/data/backup/restore.js",
  "./dist/data/backup/validate.js",
  "./dist/data/contracts/mutations.js",
  "./dist/data/contracts/repositories.js",
  "./dist/data/import/json-document.js",
  "./dist/data/indexeddb/database.js",
  "./dist/data/indexeddb/entity-lifecycle-mutations.js",
  "./dist/data/indexeddb/health.js",
  "./dist/data/indexeddb/market-cache.js",
  "./dist/data/indexeddb/metadata.js",
  "./dist/data/indexeddb/migrations.js",
  "./dist/data/indexeddb/repositories.js",
  "./dist/data/indexeddb/schema.js",
  "./dist/data/indexeddb/transaction-mutations.js",
  "./dist/diagnostics/session-log.js",
  "./dist/diagnostics/technical-report.js",
  "./dist/domain/allocations/models.js",
  "./dist/domain/allocations/position.js",
  "./dist/domain/assets/models.js",
  "./dist/domain/assets/position.js",
  "./dist/domain/audit/models.js",
  "./dist/domain/credit-cards/invoice.js",
  "./dist/domain/credit-cards/models.js",
  "./dist/domain/debts/models.js",
  "./dist/domain/debts/monthly-projection.js",
  "./dist/domain/debts/position.js",
  "./dist/domain/investments/models.js",
  "./dist/domain/investments/position.js",
  "./dist/domain/investments/quantity.js",
  "./dist/domain/ledger/ledger.js",
  "./dist/domain/ledger/models.js",
  "./dist/domain/market-data/models.js",
  "./dist/domain/market-data/provider-health.js",
  "./dist/domain/migration/models.js",
  "./dist/domain/money/money.js",
  "./dist/domain/patrimony/net-worth.js",
  "./dist/domain/products/policy.js",
  "./dist/domain/rates/rate.js",
  "./dist/domain/recurrences/models.js",
  "./dist/domain/recurrences/payment-link.js",
  "./dist/domain/recurrences/position.js",
  "./dist/identity/profile.js",
  "./dist/identity/session.js",
  "./dist/infrastructure/market-data/gateway-health.js",
  "./dist/infrastructure/market-data/http-gateway-provider.js",
  "./dist/migration/legacy/apply.js",
  "./dist/migration/legacy/convert-core.js",
  "./dist/migration/legacy/convert-planning.js",
  "./dist/migration/legacy/convert-transactions.js",
  "./dist/migration/legacy/convert-v025.js",
  "./dist/migration/legacy/fingerprint.js",
  "./dist/migration/legacy/inspect-v01.js",
  "./dist/migration/legacy/parse.js",
  "./dist/migration/legacy/shared.js",
  "./dist/platform/contracts.js",
  "./dist/platform/device-diagnostics.js",
  "./dist/platform/pwa-update.js",
  "./dist/platform/web-runtime.js",
  "./dist/presentation/accounts.js",
  "./dist/presentation/appearance.js",
  "./dist/presentation/components/feedback.js",
  "./dist/presentation/components/fields.js",
  "./dist/presentation/components/lifecycle-feedback.js",
  "./dist/presentation/components/sheets.js",
  "./dist/presentation/components/states.js",
  "./dist/presentation/components/system-status.js",
  "./dist/presentation/dom.js",
  "./dist/presentation/download.js",
  "./dist/presentation/home.js",
  "./dist/presentation/icons.js",
  "./dist/presentation/institutions.js",
  "./dist/presentation/movements.js",
  "./dist/presentation/planning.js",
  "./dist/presentation/screens/accounts-v0/controls.js",
  "./dist/presentation/screens/accounts-v0/detail.js",
  "./dist/presentation/screens/accounts-v0/forms.js",
  "./dist/presentation/screens/accounts-v0/root.js",
  "./dist/presentation/screens/accounts-v0/shared.js",
  "./dist/presentation/screens/movements-v0/controls.js",
  "./dist/presentation/screens/movements-v0/detail.js",
  "./dist/presentation/screens/movements-v0/edit.js",
  "./dist/presentation/screens/movements-v0/filters.js",
  "./dist/presentation/screens/movements-v0/list.js",
  "./dist/presentation/screens/movements-v0/new.js",
  "./dist/presentation/screens/movements-v0/shared.js",
  "./dist/presentation/screens/onboarding.js",
  "./dist/presentation/screens/planning-v0/allocations.js",
  "./dist/presentation/screens/planning-v0/commitment-forms.js",
  "./dist/presentation/screens/planning-v0/commitment-list-detail.js",
  "./dist/presentation/screens/planning-v0/commitment-payment.js",
  "./dist/presentation/screens/planning-v0/commitments.js",
  "./dist/presentation/screens/planning-v0/controls.js",
  "./dist/presentation/screens/planning-v0/debts.js",
  "./dist/presentation/screens/planning-v0/root.js",
  "./dist/presentation/screens/planning-v0/shared.js",
  "./dist/presentation/screens/settings.js",
  "./dist/presentation/settings.js",
  "./dist/presentation/shell.js",
  "./dist/privacy/redaction.js",
  "./dist/privacy/remote-disclosure.js",
  "./dist/product/capabilities.js",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/orion.css",
  "./styles/ux-v0-accounts.css",
  "./styles/ux-v0-feedback.css",
  "./styles/ux-v0-movements.css",
  "./styles/ux-v0-planning.css",
  "./styles/ux-v0-refinement.css",
  "./styles/ux-v0-shell.css",
  "./styles/ux-v0-summary.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const urls = STATIC_PATHS.map((path) => new URL(path, self.registration.scope).href);
    await cache.addAll(urls);
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('orion-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/runtime-config.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-cache' });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(new URL('./index.html', self.registration.scope).href, response.clone());
        return response;
      } catch {
        const cached = await caches.match(new URL('./index.html', self.registration.scope).href);
        return cached ?? Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(event.request);
      return cached ?? Response.error();
    }
  })());
});
