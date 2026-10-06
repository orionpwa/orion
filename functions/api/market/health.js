function json(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

export async function onRequestGet({ env }) {
    const capabilities = ['quotes-b3-sandbox'];
    if (env.BRAPI_TOKEN) {
        capabilities.push('quotes-b3', 'quotes-crypto', 'fx-brl');
    }
    if (env.ALPHAVANTAGE_API_KEY) {
        capabilities.push('quotes-international');
    }
    return json({ status: 'ok', capabilities });
}