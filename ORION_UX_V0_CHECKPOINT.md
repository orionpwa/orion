# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da UX e da evolução pós-V0 do Orion. Em conflito com documentação antiga, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.45`.
- Financial Core preservado.
- IndexedDB schema 5.
- Backup format 2.
- Database: `orion_finance_v01_rebuild`.
- Produção via Cloudflare Pages a partir de `main`, diretório `site/`.

## Checkpoints estáveis
- `UX-V0-FINAL-STABLE` ✅
- `CARTOES-CONTAS-STABLE` ✅
- `PATRIMONIO-LEITURA-STABLE` ✅
- `OUTROS-ATIVOS-STABLE` ✅
- `SITUACAO-MES-STABLE` ✅
- `INVESTIMENTOS-LEITURA-STABLE` ✅
- `INVESTIMENTOS-OPERACAO-STABLE` ✅

## Arquitetura V0 congelada
Raízes: Resumo / Movimentos / Planejar / Contas. Ajustes pertence a Resumo. Nenhum FAB global. Telas internas escondem o dock. `Novo` pertence a Movimentos. Uma função deve ter um único lugar.

## Investimentos — STABLE até 12.44
Validado no iPhone em 12.44. `INVESTIMENTOS-OPERACAO-STABLE` ✅
- cadastro B3 em BRL;
- leitura de carteira;
- compra e venda manual;
- conta de liquidação explícita;
- compra bloqueada por saldo insuficiente;
- venda bloqueada acima da posição;
- taxas participam da liquidação;
- mercado internacional/câmbio continuam separados.

## Radar de investimentos — candidato 12.45
- permanece dentro de `Patrimônio > Investimentos`;
- ranqueia ativos cadastrados com fundamentos disponíveis;
- ações e BDRs B3 usam a régua fundamentalista já existente;
- sinais: `Boa candidata`, `Em observação`, `Não priorizar` e `Dados insuficientes`;
- score é explicável por critérios, não ordem automática de compra;
- mostra P/L, P/VP, EV/EBITDA, ROE, ROIC, margem, crescimento, liquidez e endividamento quando disponíveis;
- Dividend Yield é mostrado, mas não melhora sozinho o score;
- dados automáticos continuam vindo do Market Gateway quando configurado;
- dados do briefing podem ser inseridos no detalhe do ativo e ficam no cache de fundamentos, separados das operações da carteira;
- BDR passa a ser opção de cadastro B3/BRL;
- FIIs aparecem no Radar, mas não recebem nota de ação; a régua própria de FIIs é a próxima etapa;
- Core financeiro, schema 5, backup v2 e migrations permanecem preservados.

Checkpoint esperado após validação real: `RADAR-ACOES-STABLE`.

## Próxima sequência
1. Validar 12.45 no iPhone.
2. Se aprovado, congelar `RADAR-ACOES-STABLE`.
3. Criar régua própria de FIIs com indicadores e calendário de proventos.
4. Depois, estruturar a ponte automática entre briefing e Radar, evitando digitação manual.
