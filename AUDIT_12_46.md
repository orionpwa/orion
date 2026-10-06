# Auditoria 12.46 — Controle financeiro e valorização patrimonial

## Escopo
Retirar o experimento de Radar da 12.45 e completar a função que pertence a um controlador financeiro: manter investimentos como patrimônio e atualizar seu valor por cotações externas sem transformar valorização em movimento de caixa.

## Proteções
- Financial Core não alterado.
- IndexedDB schema permanece 5.
- Backup permanece v2.
- Migrations não alteradas.
- Compra/venda continuam usando `recordInvestmentTrade` e as proteções já estáveis.
- Market data grava somente snapshots de cotação no cache de mercado.
- Sem cotação, `getPortfolioSnapshot` continua usando custo.
- API externa fica atrás de Cloudflare Pages Functions; tokens não chegam ao navegador.
- Service worker não armazena respostas de `/api/market/`.
- Radar/fundamentos não são inicializados nem exibidos.

## Cobertura de mercado
- B3/FII/ETF/BDR: brapi.
- Cripto: brapi em BRL.
- Ações internacionais: Alpha Vantage; preço convertido para BRL pelo gateway.
- Sem credencial externa, o app degrada para custo da posição sem quebrar o restante do Orion.

## Validação técnica
- arquivos JavaScript novos/alterados passam em `node --check`;
- integração do envelope do Pages Function com `HttpMarketGatewayProvider` validada em teste local;
- baseline Financial Core 12.38 executada: 194/194 testes aprovados;
- nenhuma alteração de dados persistentes é exigida para atualizar da 12.45.

## Teste físico necessário
Validar atualização de versão e cotações no PWA do iPhone; após aprovação, congelar `VALORIZACAO-PATRIMONIAL-STABLE`.