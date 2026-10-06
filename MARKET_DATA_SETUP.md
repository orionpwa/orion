# Market data — configuração server-side

O Orion nunca deve guardar tokens de mercado no frontend.

## Cloudflare Pages
Em Workers & Pages > Orion > Settings > Variables and Secrets, configure:

- `BRAPI_TOKEN`: necessário para cotações gerais da B3/FIIs/ETFs/BDRs e cripto. Sem ele, apenas os tickers sandbox permitidos pela brapi funcionam.
- `ALPHAVANTAGE_API_KEY`: opcional, necessário para ações internacionais.

As Pages Functions em `functions/api/market/` leem esses segredos server-side. `site/runtime-config.json` aponta o PWA para `/api/market`, sem expor credenciais.

Após alterar secrets, faça um novo deploy do projeto se o painel do Cloudflare solicitar.