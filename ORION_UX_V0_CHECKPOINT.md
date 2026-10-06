# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da UX e da evolução pós-V0 do Orion. Em conflito com documentação antiga, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.51`.
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

## 12.50 — progresso de metas e reservas
A 12.50 introduziu percentual, valor restante e barra de progresso para reservas com objetivo definido. Durante a validação conceitual, a opção `Reduzir o Livre para decidir?` mostrou-se redundante e confusa, pois o cálculo financeiro atual já considera os valores ativos de metas e reservas na redução do Livre.

A 12.50 não é congelada isoladamente; seu progresso visual é incorporado e simplificado na 12.51.

## 12.51 — reserva simples + progresso de dívidas — CANDIDATO
Objetivo: deixar a fase Reserva → Dívidas direta e sem controles redundantes.

### Reservas
- `Planejar > Metas e reservas` continua sendo o único lugar de gestão;
- todo valor reservado fica automaticamente fora do `Livre para decidir`;
- a pergunta `Reduzir o Livre para decidir?` foi removida;
- novas reservas são gravadas com `protected: true` para manter compatibilidade sem mudar schema;
- editar ou ajustar uma reserva também normaliza `protected: true`;
- reservar continua sem criar movimentação bancária nem alterar o saldo real da conta;
- objetivo definido continua mostrando percentual, barra de progresso e quanto falta;
- ao atingir ou ultrapassar o objetivo, exibe `Objetivo alcançado`.

### Dívidas
- lista passa a mostrar percentual já pago;
- detalhe mostra progresso da quitação, valor pago e saldo restante;
- quando existir oferta de quitação abaixo do saldo restante, o Orion mostra a economia potencial;
- oferta e validade continuam sendo informações manuais, sem recomendação automática de negociação;
- pagamentos continuam sendo os únicos eventos que reduzem o saldo da dívida.

### Garantias
- nenhuma alteração de Financial Core;
- schema 5, backup v2 e migrations preservados;
- carteira e mercado permanecem desativados;
- gate público verifica sintaxe, coerência de versão, reserva simplificada e progresso de dívidas.

Checkpoint esperado após validação real: `RESERVA-SIMPLES-DIVIDAS-PROGRESSO-STABLE`.

## Próxima sequência
1. Publicar 12.51.
2. Validar no iPhone que a reserva não pergunta mais se deve reduzir o Livre.
3. Confirmar que o valor reservado continua reduzindo o Livre para decidir.
4. Abrir uma dívida e conferir progresso e, quando houver oferta, economia potencial.
5. Se aprovado, congelar `RESERVA-SIMPLES-DIVIDAS-PROGRESSO-STABLE`.
6. A próxima evolução só deve aprofundar dívidas se surgir uma necessidade real no uso.
