# Auditoria 12.43 — Investimentos em leitura

## Escopo
Expor a carteira de investimentos já existente dentro de Patrimônio, em leitura, sem criar nova raiz e sem habilitar operações.

## Proteções verificadas
- Financial Core, schema 5, backup v2 e migrations não foram alterados.
- A tela consome `getPortfolioSnapshot` já existente.
- Nenhuma compra, venda, cadastro ou mutação é criada por esta tela.
- Ausência de cotação mantém a base pelo custo e é informada ao usuário.
- Cotação desatualizada é sinalizada.
- A rota interna retorna explicitamente para Patrimônio.
- JavaScript alterado passou em `node --check`.
- Service worker mantém a lista de runtime e apenas renova o cache para 12.43.

## Teste real necessário
Validar no iPhone a entrada em Patrimônio > Ver investimentos, estado vazio ou posições existentes e retorno.
