# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da UX e da evolução pós-V0 do Orion. Em conflito com documentação antiga, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.53`.
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
- `RESERVA-SIMPLES-DIVIDAS-PROGRESSO-STABLE` ✅ — 12.51 aprovada.
- `SIMULACAO-QUITACAO-STABLE` ✅ — 12.52 fechada após gate e aprovação para prosseguir.

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
- carteira de investimentos removida da navegação e do uso normal;
- gateway de mercado desativado;
- dados antigos de investimentos preservados para eventual reativação;
- Patrimônio, outros ativos, contas, cartões, compromissos, dívidas, metas e reservas permanecem ativos;
- Financial Core, schema 5, backup v2 e migrations preservados.

## 12.51 — reserva simples + progresso de dívidas — STABLE
### Reservas
- todo valor reservado fica automaticamente fora do `Livre para decidir`;
- não existe pergunta separada para proteger ou reduzir o Livre;
- reservar não cria movimentação bancária nem altera saldo real da conta;
- objetivo mostra percentual, progresso e valor restante.

### Dívidas
- lista e detalhe mostram progresso da quitação;
- pagamentos são os únicos eventos que reduzem o saldo da dívida;
- oferta de quitação pode mostrar economia potencial, sem recomendação automática.

## 12.52 — simulação de quitação — STABLE
- `Planejar > Dívidas > detalhe` possui `Simular quitação`;
- usa o saldo restante atual;
- recebe pagamento mensal e juros mensais informados pelo usuário;
- mostra prazo estimado, total pago e juros estimados;
- informa quando o pagamento não amortiza a dívida;
- simular não cria pagamento, não movimenta conta, não altera saldo da dívida e não persiste plano.

Checkpoint congelado: `SIMULACAO-QUITACAO-STABLE`.

## 12.53 — Personal Ready — CANDIDATO
Objetivo: encerrar o ciclo de desenvolvimento funcional atual e preparar a transição da base de testes para uso pessoal real.

### Recomeço seguro
- `Resumo > Ajustes > Recomeçar com uma base nova` continua sendo o único caminho para abandonar a base atual;
- antes da limpeza, o Orion cria e baixa um backup do perfil;
- somente depois substitui atomicamente os dados locais por uma base vazia;
- o mesmo id de perfil é preservado;
- contas, movimentos, cartões, dívidas, ativos, reservas, compromissos e dados de investimento da base corrente são zerados na nova base;
- `onboardingCompletedAt` não é carregado para a base nova, portanto o onboarding é reaberto;
- nenhuma mudança de schema ou formato de backup.

### Marco zero da base real
A entrada em uso pessoal parte de um retrato do dia atual, não de uma reconstrução histórica:
1. cadastrar contas ativas com o saldo real atual;
2. cadastrar a reserva mínima e o valor efetivamente reservado;
3. cadastrar dívidas ativas pelo saldo atual em aberto;
4. cadastrar compromissos recorrentes que ainda terão efeito futuro;
5. registrar receitas, despesas, transferências e pagamentos somente a partir do marco zero.

O histórico anterior não é requisito para o Orion ficar correto daqui para frente.

### Escopo ativo
- Essenciais → Reserva mínima → Dívidas → Reserva completa;
- investimentos e mercado permanecem desativados;
- nenhuma nova frente funcional é aberta nesta release.

### Garantias
- Financial Core preservado;
- schema 5 e backup v2 preservados;
- gate público valida sintaxe, coerência de versão, reserva, dívidas, simulação e segurança do recomeço;
- o roteiro operacional completo está em `PERSONAL_READY.md`.

Checkpoint esperado após validação real: `PERSONAL-READY-STABLE`.

## Próxima sequência
1. Publicar 12.53.
2. Confirmar no iPhone que a versão abre normalmente.
3. Em `Ajustes > Recomeçar com uma base nova`, gerar o backup e abandonar a base de testes.
4. Concluir o onboarding com a primeira conta e saldo real atual.
5. Cadastrar contas restantes, reserva mínima, dívidas e compromissos futuros.
6. A partir desse marco, usar o Orion normalmente e só evoluir quando o uso real revelar uma necessidade concreta.
