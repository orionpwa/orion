# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da UX e da evolução pós-V0 do Orion. Em conflito com documentação antiga, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.46`.
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

## Direção do produto
Orion é um controlador financeiro pessoal. Ele registra fatos, planejamento e patrimônio.

Pertence ao Orion:
- contas, saldos e movimentos;
- cartões, compromissos, dívidas, metas e reservas;
- patrimônio líquido e outros ativos;
- investimentos como posição patrimonial: compra, venda, quantidade, custo, valor atual e resultado;
- cotações de mercado apenas para atualizar o valor patrimonial.

Não pertence ao Orion:
- recomendação de compra;
- ranking de ativos;
- score fundamentalista;
- P/L, P/VP, ROE, ROIC ou screener para decidir o que comprar;
- integração do briefing como motor de recomendação.

O experimento de Radar da 12.45 não vira checkpoint estável e é retirado da experiência na 12.46.

## Investimentos — STABLE até 12.44
Validado no iPhone em 12.44. `INVESTIMENTOS-OPERACAO-STABLE` ✅
- cadastro e leitura de carteira;
- compra e venda manual;
- conta de liquidação explícita;
- compra bloqueada por saldo insuficiente;
- venda bloqueada acima da posição;
- taxas participam da liquidação;
- compra troca caixa por patrimônio e não vira despesa de consumo.

## Valorização patrimonial — candidato 12.46
- permanece dentro de `Patrimônio > Investimentos`;
- Radar e fundamentos foram removidos da UI;
- ações B3, FIIs, ETFs, BDRs, cripto e ações internacionais podem ser registrados;
- todo custo/liquidação permanece em reais para não misturar moedas no Financial Core;
- cotação automática atualiza somente o valor patrimonial, sem criar movimentação;
- ausência de cotação usa custo da posição como fallback;
- atualização automática ocorre ao iniciar/retomar o app quando devida;
- usuário também pode solicitar `Atualizar cotações`;
- B3/FII/ETF/BDR e cripto usam brapi através de Pages Function;
- ações internacionais usam Alpha Vantage e conversão para BRL no gateway;
- tokens ficam somente no ambiente server-side do Cloudflare, nunca no PWA;
- API de mercado é `no-store` no service worker;
- Core financeiro, schema 5, backup v2 e migrations permanecem preservados.

Checkpoint esperado após validação real: `VALORIZACAO-PATRIMONIAL-STABLE`.

## Próxima sequência
1. Publicar 12.46.
2. Configurar `BRAPI_TOKEN` no Cloudflare para cobertura B3/FII/ETF/BDR e cripto.
3. Opcionalmente configurar `ALPHAVANTAGE_API_KEY` para ações internacionais.
4. Validar no iPhone: compra não altera PL; cotação altera valor atual/PL sem criar movimento; fallback por custo funciona offline.
5. Se aprovado, congelar `VALORIZACAO-PATRIMONIAL-STABLE` e encerrar esta expansão funcional.