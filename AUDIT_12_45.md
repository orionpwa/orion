# Auditoria 12.45 — Radar de investimentos

## Escopo
Expor o motor de Radar já existente na UX de Investimentos e permitir alimentação controlada por fundamentos vindos do briefing.

## Proteções
- Financial Core não alterado.
- Schema 5, backup v2 e migrations não alterados.
- Radar não registra compra/venda e não movimenta contas.
- Compra/venda continuam exclusivamente no fluxo de operação do investimento.
- Dividend Yield é informativo e não aumenta isoladamente o score.
- FIIs não recebem score da régua de ações.
- Dados manuais ficam no Market Data Cache e mantêm período de referência.
- Dados automáticos continuam dependentes do Market Gateway já existente.

## Validação técnica
- `site/dist/app/routes/summary.js`: `node --check` aprovado.
- `site/dist/app/version.js`: `node --check` aprovado.
- `site/service-worker.js`: `node --check` aprovado.

## Teste real necessário
No iPhone: abrir Investimentos, conferir o bloco Radar, inserir fundamentos em um ativo de ação/BDR e confirmar recálculo do sinal e score após salvar.
