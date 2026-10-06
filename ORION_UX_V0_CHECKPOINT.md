# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da UX e da evolução pós-V0 do Orion. Em conflito com documentação antiga, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.50`.
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
- `FOCO-RESERVA-DIVIDAS-STABLE` ✅ — 12.49 validada no iPhone.

## Arquitetura V0 congelada
Raízes: Resumo / Movimentos / Planejar / Contas. Ajustes pertence a Resumo. Nenhum FAB global. Telas internas escondem o dock. `Novo` pertence a Movimentos. Uma função deve ter um único lugar.

## Direção atual do produto
Orion é um controlador financeiro pessoal. A experiência atual acompanha a fase financeira real do usuário, sem antecipar módulos que ainda não são necessários.

Prioridade operacional atual:
1. manter o essencial sob controle;
2. formar a reserva mínima;
3. quitar dívidas;
4. fortalecer a reserva;
5. somente depois retomar investimentos.

## 12.49 — foco em reserva e dívidas — STABLE
Validada no iPhone.
- carteira de investimentos removida da navegação e do uso normal;
- gateway de mercado desativado;
- nenhum dado antigo de investimentos foi apagado;
- compatibilidade dos dados de investimentos permanece preservada para eventual reativação futura;
- Patrimônio, outros ativos, contas, cartões, compromissos, dívidas, metas e reservas permanecem ativos;
- Financial Core, schema 5, backup v2 e migrations não mudaram.

Investimentos passam a ser recurso adiado. Checkpoints históricos de investimento continuam válidos como registro técnico, mas não definem a experiência ativa.

## 12.50 — progresso de metas e reservas — CANDIDATO
Objetivo: tornar a reserva útil para a fase atual sem criar uma nova área.
- `Planejar > Metas e reservas` continua sendo o único lugar de gestão;
- quando houver objetivo total, a lista mostra percentual e quanto falta;
- o detalhe mostra barra de progresso, percentual, valor restante e objetivo;
- ao atingir ou ultrapassar o objetivo, exibe `Objetivo alcançado`;
- metas sem objetivo continuam funcionando como antes;
- ajustar valor reservado continua sem criar movimentação bancária;
- não há alteração de schema, backup, migrations ou Financial Core;
- carteira e mercado continuam desativados.

Checkpoint esperado após validação real: `PROGRESSO-RESERVAS-STABLE`.

## Próxima sequência
1. Publicar 12.50.
2. Validar no iPhone uma reserva com objetivo definido.
3. Confirmar percentual, valor restante e estado `Objetivo alcançado`.
4. Se aprovado, congelar `PROGRESSO-RESERVAS-STABLE`.
5. Só então avaliar refinamentos de dívidas conforme a necessidade real.
