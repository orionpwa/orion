# Auditoria 12.44 — Operações de investimentos

## Escopo
Completar o fluxo de investimentos dentro de Patrimônio usando o núcleo existente de instrumentos e trades.

## Proteções verificadas
- Financial Core, schema 5, backup v2 e migrations não foram alterados.
- Cadastro desta etapa fica limitado a B3/BRL.
- Compra usa `recordInvestmentTrade` e exige saldo suficiente na conta de liquidação.
- Venda usa `recordInvestmentTrade` e bloqueia quantidade acima da posição.
- Taxas são preservadas no trade e na liquidação.
- Carteira continua usando cotação quando disponível e custo como fallback.
- Posições zeradas recém-cadastradas permanecem acessíveis para registrar a primeira compra.
- Rotas novas são internas a Patrimônio; nenhuma raiz foi adicionada.
- JavaScript alterado passou em `node --check`.
- Service worker mantém o conjunto estático da 12.43 e apenas renova o cache para 12.44.

## Teste real necessário
Cadastrar um instrumento, registrar compra e venda e confirmar saldo, quantidade, patrimônio e persistência no iPhone.
