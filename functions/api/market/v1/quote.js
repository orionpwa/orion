const BRAPI_BASE = 'https://brapi.dev';
const ALPHA_BASE = 'https://www.alphavantage.co/query';
const SANDBOX_B3 = new Set(['PETR4', 'MGLU3', 'VALE3', 'ITUB4']);

function json(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}
function cleanSymbol(raw) {
    const symbol = (raw ?? '').trim().toUpperCase();
    return /^[A-Z0-9.\-]{1,18}$/.test(symbol) ? symbol : null;
}
function priceCents(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0)
        return null;
    const cents = Math.round(number * 100);
    return Number.isSafeInteger(cents) ? cents : null;
}
function bearer(token) {
    return token ? { authorization: `Bearer ${token}` } : {};
}
async function fetchJson(url, init = {}) {
    const response = await fetch(url, {
        ...init,
        headers: { accept: 'application/json', ...(init.headers ?? {}) },
        cf: { cacheTtl: 0, cacheEverything: false }
    });
    if (!response.ok) {
        const error = new Error(`provider-${response.status}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}
function envelope({ symbol, venue, currency, cents, providerId, asOf, delay }) {
    const now = new Date().toISOString();
    return {
        quote: {
            symbol,
            venue,
            currency,
            priceCents: cents,
            providerId,
            providerRole: 'primary',
            asOf: asOf && Number.isFinite(Date.parse(asOf)) ? asOf : now,
            fetchedAt: now,
            delay
        }
    };
}
async function b3Quote(symbol, env) {
    if (!env.BRAPI_TOKEN && !SANDBOX_B3.has(symbol))
        return json({ error: 'market_provider_not_configured', provider: 'brapi' }, 503);
    const url = new URL('/api/v2/stocks/quote', BRAPI_BASE);
    url.searchParams.set('symbols', symbol);
    const data = await fetchJson(url, { headers: bearer(env.BRAPI_TOKEN) });
    const result = data?.results?.[0];
    const quote = result?.data ?? result;
    const cents = priceCents(quote?.regularMarketPrice);
    if (cents == null)
        return json({}, 404);
    const asOf = quote?.regularMarketTime ?? data?.requestedAt;
    return json(envelope({ symbol, venue: 'B3', currency: 'BRL', cents, providerId: 'brapi', asOf, delay: 'delayed' }));
}
async function cryptoQuote(symbol, env) {
    if (!env.BRAPI_TOKEN)
        return json({ error: 'market_provider_not_configured', provider: 'brapi' }, 503);
    const url = new URL('/api/v2/crypto', BRAPI_BASE);
    url.searchParams.set('coin', symbol);
    url.searchParams.set('currency', 'BRL');
    const data = await fetchJson(url, { headers: bearer(env.BRAPI_TOKEN) });
    const quote = data?.coins?.[0];
    const cents = priceCents(quote?.regularMarketPrice);
    if (cents == null)
        return json({}, 404);
    return json(envelope({
        symbol,
        venue: 'CRYPTO',
        currency: 'BRL',
        cents,
        providerId: 'brapi-crypto',
        asOf: quote?.regularMarketTime ?? data?.requestedAt,
        delay: 'delayed'
    }));
}
async function alphaFxUsdBrl(env) {
    const url = new URL(ALPHA_BASE);
    url.searchParams.set('function', 'CURRENCY_EXCHANGE_RATE');
    url.searchParams.set('from_currency', 'USD');
    url.searchParams.set('to_currency', 'BRL');
    url.searchParams.set('apikey', env.ALPHAVANTAGE_API_KEY);
    const data = await fetchJson(url);
    const rate = Number(data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
}
async function brapiFxUsdBrl(env) {
    if (!env.BRAPI_TOKEN)
        return null;
    const url = new URL('/api/v2/currency', BRAPI_BASE);
    url.searchParams.set('currency', 'USD-BRL');
    const data = await fetchJson(url, { headers: bearer(env.BRAPI_TOKEN) });
    const rate = Number(data?.currency?.[0]?.bidPrice);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
}
async function internationalQuote(symbol, venue, env) {
    if (!env.ALPHAVANTAGE_API_KEY)
        return json({ error: 'market_provider_not_configured', provider: 'alphavantage' }, 503);
    const quoteUrl = new URL(ALPHA_BASE);
    quoteUrl.searchParams.set('function', 'GLOBAL_QUOTE');
    quoteUrl.searchParams.set('symbol', symbol);
    quoteUrl.searchParams.set('apikey', env.ALPHAVANTAGE_API_KEY);
    const data = await fetchJson(quoteUrl);
    const quote = data?.['Global Quote'];
    const priceUsd = Number(quote?.['05. price']);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0)
        return json({}, 404);
    let rate = null;
    try {
        rate = await brapiFxUsdBrl(env);
    }
    catch {
        rate = null;
    }
    if (rate == null)
        rate = await alphaFxUsdBrl(env);
    if (rate == null)
        return json({ error: 'fx_unavailable' }, 503);
    const cents = priceCents(priceUsd * rate);
    if (cents == null)
        return json({}, 404);
    const latestDay = quote?.['07. latest trading day'];
    const asOf = /^\d{4}-\d{2}-\d{2}$/.test(latestDay ?? '') ? `${latestDay}T23:59:59.000Z` : undefined;
    return json(envelope({
        symbol,
        venue,
        currency: 'BRL',
        cents,
        providerId: env.BRAPI_TOKEN ? 'alphavantage+brapi-fx' : 'alphavantage',
        asOf,
        delay: 'end-of-day'
    }));
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const symbol = cleanSymbol(url.searchParams.get('symbol'));
        const venue = (url.searchParams.get('venue') ?? '').trim().toUpperCase();
        const currency = (url.searchParams.get('currency') ?? '').trim().toUpperCase();
        if (!symbol || !venue || currency !== 'BRL')
            return json({ error: 'invalid_request' }, 400);
        if (venue === 'B3')
            return await b3Quote(symbol, env);
        if (venue === 'CRYPTO')
            return await cryptoQuote(symbol, env);
        if (['US', 'NASDAQ', 'NYSE', 'INTERNATIONAL'].includes(venue))
            return await internationalQuote(symbol, venue, env);
        return json({}, 404);
    }
    catch (error) {
        const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 600 ? error.status : 502;
        return json({ error: 'market_provider_unavailable' }, status);
    }
}