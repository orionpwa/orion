# Auditoria 12.42 — Situação do mês

## Escopo
Expor no Resumo o status financeiro já calculado pelo dashboard, sem criar nova regra financeira.

## Proteções verificadas
- Financial Core, schema 5, backup v2 e migrations não foram alterados.
- `financialStatusFor` permanece a única regra de classificação.
- A UI apenas apresenta `comfortable`, `attention` ou `tight`.
- Nenhuma movimentação, conta, compromisso, dívida, meta, cartão ou ativo é alterado pelo recurso.
- Verde, atenção e vermelho são usados somente como semântica de estado.
- JavaScript alterado passou em `node --check`.
- Service worker mantém a mesma lista de runtime e apenas renova o cache para 12.42.
- Release manifest cobre somente o delta de runtime da 12.42.

## Teste real necessário
Validar no iPhone a seção Situação do mês e confirmar que o restante do Resumo permanece estável.
