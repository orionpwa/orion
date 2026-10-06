# Orion Finance — Personal Ready

## Objetivo

Entrar em uso pessoal real sem carregar a sujeira da base de testes e sem exigir reconstrução de meses anteriores.

O ponto de partida oficial é um **retrato financeiro do dia em que a base real começa**. O Orion passa a registrar os fatos dali em diante.

## 1. Encerrar a base de testes

Em `Resumo > Ajustes > Recomeçar com uma base nova`, usar `Criar backup e recomeçar`.

Antes de limpar o perfil local, o Orion gera um backup da base atual. Guarde esse arquivo. A base nova mantém o mesmo perfil local, zera os dados financeiros e reabre o onboarding.

## 2. Onboarding e primeira conta

No onboarding:
- informar o nome de uso;
- cadastrar a primeira conta ativa;
- usar como saldo inicial o **saldo real disponível naquele momento**.

Não reconstruir entradas e saídas antigas apenas para chegar ao saldo atual. O saldo inicial é o marco zero da nova base.

## 3. Contas restantes

Em `Contas`, cadastrar somente as contas que ainda fazem parte da vida financeira atual, cada uma com seu saldo real do momento.

Limite de cartão, limite de conta e crédito disponível não são saldo bancário.

## 4. Reserva mínima

Em `Planejar > Metas e reservas`, criar a reserva mínima com o objetivo definido para esta fase.

O valor efetivamente reservado continua fisicamente na conta escolhida, mas fica automaticamente fora do `Livre para decidir`.

Não criar movimentação para separar a reserva. Ajustar o valor reservado é uma separação lógica dentro do Orion.

## 5. Dívidas

Em `Planejar > Dívidas`, cadastrar cada dívida ativa pelo **saldo que ainda falta pagar no dia de início da base real**.

Registrar, quando conhecido:
- nome e credor;
- saldo em aberto atual;
- oferta de quitação e validade, se existir.

Não é obrigatório reconstruir pagamentos anteriores. O progresso da dívida passa a ser acompanhado a partir deste marco zero. Pagamentos futuros devem ser registrados pelo fluxo `Registrar pagamento`.

A simulação de quitação pode ser usada para testar cenários de pagamento mensal e juros sem alterar a dívida real.

## 6. Compromissos futuros

Em `Planejar > Compromissos`, cadastrar apenas contas recorrentes e compromissos que ainda terão efeito daqui para frente.

Recorrência é previsão. A movimentação financeira só passa a existir quando o pagamento real for registrado ou vinculado.

## 7. Movimentos a partir do marco zero

A partir da nova base:
- receitas entram quando realmente caem;
- despesas entram quando realmente saem;
- transferências apenas movem dinheiro entre contas e não alteram patrimônio líquido;
- pagamentos de dívida reduzem a conta usada e o saldo da dívida;
- valores reservados reduzem o Livre para decidir, não o saldo bancário.

## 8. O que fica adiado

Enquanto a prioridade operacional for `Essenciais → Reserva mínima → Dívidas → Reserva completa`, investimentos e cotações de mercado permanecem fora da experiência ativa.

Os dados técnicos antigos de investimentos continuam compatíveis no banco e no backup, mas não fazem parte do fluxo pessoal atual.

## Critério de Personal Ready

A base está pronta para rotina quando:
1. todas as contas ativas refletem seus saldos reais atuais;
2. a reserva mínima está cadastrada com valor e objetivo corretos;
3. todas as dívidas ativas estão registradas pelo saldo atual;
4. compromissos futuros relevantes estão cadastrados;
5. os próximos fatos financeiros passam a ser registrados normalmente.

A partir daí, novas funções só entram quando o uso real revelar uma necessidade concreta.
