# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX e da evolução pós-V0 do Orion. Em conflito com layouts/documentação antigos, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.44`.
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
- `SITUACAO-MES-STABLE` ✅
- `INVESTIMENTOS-LEITURA-STABLE` ✅

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
- Situação do mês: Confortável, Atenção ou Apertado.
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

## Pós-V0 — Patrimônio
- `Resumo > Mais recursos > Patrimônio`.
- Patrimônio líquido, ativos e passivos em leitura.
- Outros ativos podem ser cadastrados e ter valor atualizado sem movimentar conta.
- Investimentos compõem patrimônio pelo custo quando não há cotação e pela cotação quando disponível.

## Pós-V0 — Investimentos · candidato 12.44
- permanece dentro de `Patrimônio > Investimentos`, sem nova raiz;
- leitura da carteira 12.43 passa a ser `INVESTIMENTOS-LEITURA-STABLE`;
- permite cadastrar instrumento B3 em BRL com código, nome e tipo;
- permite registrar compra e venda manualmente;
- compra exige conta de liquidação e saldo suficiente;
- venda não pode exceder a quantidade disponível;
- taxas entram no cálculo da liquidação;
- posições sem operação continuam visíveis para permitir iniciar a compra;
- mercado internacional e câmbio permanecem fora desta etapa para não misturar moedas sem regra explícita;
- Core, schema 5, backup v2 e migrations permanecem preservados.

Checkpoint esperado após validação real: `INVESTIMENTOS-OPERACAO-STABLE`.

## Próxima sequência
1. Validar 12.44 no iPhone.
2. Se aprovado, congelar `INVESTIMENTOS-OPERACAO-STABLE`.
3. Escolher a próxima lacuna funcional pelo uso real.
