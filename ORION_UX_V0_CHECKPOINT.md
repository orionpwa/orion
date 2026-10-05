# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX e da evolução pós-V0 do Orion. Em conflito com layouts/documentação antigos, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.42`.
- Financial Core preservado.
- IndexedDB schema 5.
- Backup format 2.
- Database: `orion_finance_v01_rebuild`.
- Build publicado em `site/`; produção via Cloudflare Pages a partir de `main`.

## Checkpoints estáveis
- `UX-V0-BASELINE-STABLE` ✅
- `RESUMO-STABLE` ✅
- `MOVIMENTOS-STABLE` ✅
- `UPDATE-BANNER-STABLE` ✅
- `PLANEJAR-STABLE` ✅
- `CONTAS-STABLE` ✅
- `LEGACY-CLEANUP-STABLE` ✅
- `UX-FUNCTIONAL-REFINEMENT-STABLE` ✅
- `AJUSTES-STABLE` ✅
- `IDENTIDADE-V1-STABLE` ✅
- `MARCA-V1-STABLE` ✅
- `APARENCIA-LEGACY-REMOVED` ✅
- `UX-V0-FINAL-STABLE` ✅
- `CARTOES-CONTAS-STABLE` ✅
- `PATRIMONIO-LEITURA-STABLE` ✅
- `OUTROS-ATIVOS-STABLE` ✅

## Arquitetura V0 congelada
Raízes da navegação:
1. Resumo
2. Movimentos
3. Planejar
4. Contas

Ajustes pertence a Resumo e não é quinta raiz.

### Regras permanentes
- Bottom navigation somente nas quatro telas-raiz.
- Nenhum FAB global.
- Telas internas escondem o dock e oferecem retorno explícito.
- `Novo` pertence a Movimentos.
- Safe-area do iPhone fica dentro da barra inferior.
- PWA instalado preenche a altura física disponível.
- Mobile-first; 320 px é stress test mínimo.
- Sem `...` em informação financeira importante.
- Sem menus de três pontos para ações essenciais.
- Sem sheets empilhadas nos fluxos principais.
- Uma função deve ter um único lugar.
- Transferência é fato neutro e não altera resultado nem patrimônio líquido.

## Mapa funcional estável
### Resumo
- Livre para decidir, Disponível, Compromissos, Metas e reservas.
- Este mês: Entrou, Saiu e Resultado.
- Próximos compromissos.
- Mais recursos contém Patrimônio.
- Não cria movimentação e não gerencia contas.

### Movimentos
- Histórico, filtros e estados vazios.
- Novo: Despesa, Receita e Transferência.
- Detalhe, edição, exclusão e desfazer em telas dedicadas.
- Compras no cartão pertencem a `Movimentos > Novo`.

### Planejar
- Compromissos, Dívidas, Metas e reservas.
- Previsão permanece separada de fato.
- Pagamentos/vínculos preservam histórico.
- Dívidas têm pagamento dedicado e Core bloqueia pagamento acima do saldo.
- Ajuste de reserva não cria movimentação bancária.

### Contas
- Contas ativas, saldos, detalhe e histórico recente.
- Adicionar conta pertence a Contas.
- Saldo inicial não é editável.
- Cartões de crédito são cadastrados e administrados dentro de Contas.
- Pagamento de fatura exige conta escolhida e não excede a fatura aberta.

### Ajustes
- Perfil, Dados e backup, Privacidade, Sobre o Orion e Recomeçar.
- Aparência antiga não retorna: identidade oficial é única.

## Identidade e marca — STABLE
- Grafite profundo + azul safira frio.
- Verde/vermelho somente para semântica financeira/estado.
- Símbolo: anel contínuo + três barras ascendentes.
- Nome completo: Orion Finance; nome curto: Orion.
- Marca validada no iPhone após reinstalação do PWA.
- Sem estrelas, planetas ou gradientes decorativos.

## Pós-V0 — Cartões em Contas · STABLE
Validado no iPhone em 12.39. `CARTOES-CONTAS-STABLE` ✅

## Pós-V0 — Patrimônio em Resumo · STABLE
Validado no iPhone em 12.40. `PATRIMONIO-LEITURA-STABLE` ✅
- `Resumo > Mais recursos > Patrimônio`.
- Patrimônio líquido, Ativos e Passivos em leitura.
- Composição distingue dinheiro em contas, outros ativos, investimentos, dívidas, cartões e saldos negativos.
- Metas e reservas organizam caixa e não reduzem patrimônio líquido.

## Pós-V0 — Outros ativos · STABLE
Validado no iPhone em 12.41. `OUTROS-ATIVOS-STABLE` ✅
- gerenciamento dentro de Patrimônio, sem nova raiz;
- valor inicial entra no patrimônio sem movimentar conta;
- atualização de valor registra somente a diferença;
- edição e desativação preservam histórico;
- ativos técnicos de garantia não aparecem na gestão genérica.

## Pós-V0 — Situação do mês · candidato 12.42
- entra diretamente no Resumo, sem nova tela ou nova raiz;
- reutiliza o status financeiro já calculado pelo dashboard;
- estados: `Confortável`, `Atenção` e `Apertado`;
- `Apertado`: Disponível ou Livre abaixo de zero;
- `Atenção`: resultado mensal negativo, ou Livre zerado com compromissos/reservas;
- `Confortável`: nenhuma das condições anteriores;
- somente leitura, sem criar nova regra financeira;
- cores seguem semântica de estado: verde, atenção e vermelho;
- Core, schema 5, backup v2 e migrations permanecem preservados.

Checkpoint esperado após validação real: `SITUACAO-MES-STABLE`.

## Próxima sequência
1. Validar 12.42 no iPhone.
2. Se aprovado, congelar `SITUACAO-MES-STABLE`.
3. Escolher a próxima lacuna funcional pelo uso real, sem abrir nova raiz desnecessariamente.
