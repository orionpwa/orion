# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX do Orion. Em conflito com layouts/documentação antigos, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.32`.
- Financial Core preservado.
- IndexedDB schema 5.
- Backup format 2.
- `src/application/`, `src/domain/`, `src/data/` e `src/migration/` permanecem congelados nesta reconstrução visual.
- Build limpa `dist/` antes de recompilar para impedir artefatos JS órfãos.

## Checkpoints estáveis
- `UX-V0-BASELINE-STABLE` ✅
- `RESUMO-STABLE` ✅
- `MOVIMENTOS-STABLE` ✅
- `UPDATE-BANNER-STABLE` ✅
- `PLANEJAR-STABLE` ✅
- `CONTAS-STABLE` ✅
- `LEGACY-CLEANUP-STABLE` ✅

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
- Safe-area do iPhone fica dentro da própria barra inferior.
- Barra inferior visualmente encostada à base, sem faixa/vão externo.
- PWA instalado preenche a altura física disponível.
- Mobile-first; 320 px é stress test mínimo.
- Sem truncamento por `...` em informação financeira importante.
- Sem menus de três pontos para ações essenciais.
- Sem sheets empilhadas nos fluxos V0 principais.
- Uma função deve ter um único lugar.
- Branding/identidade final só depois da estrutura e refinamento funcional.

## Resumo — STABLE
- Livre para decidir.
- Disponível, Compromissos, Metas e reservas.
- Este mês: Entrou, Saiu e Resultado, ou estado vazio.
- Próximos compromissos.
- Não cria movimentação e não gerencia contas.

## Movimentos — STABLE
- Histórico e estado vazio.
- Novo: Despesa, Receita e Transferência.
- Detalhe, edição e exclusão/desfazer em telas dedicadas.
- Filtros em tela própria; sem busca permanente.
- Transferência é fato neutro.

## Planejar — STABLE
Raiz somente com:
- Compromissos
- Dívidas
- Metas e reservas

Compromissos: previsão separada de fato; ignorar/voltar; registrar ou vincular pagamento/recebimento; desvincular preserva a movimentação.

Dívidas: saldo restante e histórico; saldo não editável diretamente; pagamento dedicado; sem conta arbitrariamente pré-selecionada; Core rejeita pagamento acima do saldo.

Metas/reservas: ação `Ajustar valor reservado`; ajuste não cria movimentação bancária; efeito sobre Livre explícito.

## Contas — STABLE
- Lista contas ativas e saldos.
- `Adicionar conta` pertence a Contas.
- Detalhe dedicado com saldo atual, instituição, tipo, disponibilidade e saldo inicial.
- Até cinco movimentos recentes; histórico completo abre Movimentos filtrado pela conta.
- Saldo inicial não é editável após criação.
- Sem atalhos duplicados de Receita, Despesa ou Transferência.

## Banner de atualização — STABLE
- `Atualização disponível` + `Atualizar`.
- Compacto, responsivo, sem cápsula larga e sem ellipsis.
- Permanece até a ação e respeita safe-area/dock oculto.

## Limpeza segura — STABLE
Validado no iPhone em 12.31. Removido somente código sem consumidores reais:
- branding visual antigo;
- actions sheet genérica antiga;
- telas antigas de criação/edição/lista de movimentações;
- árvore antiga de Planejar baseada em sheets/menus de três pontos;
- JS compilado correspondente no pacote publicado.

Proteções:
- desativação V0 mantém ação `Desfazer` via gateway auditável;
- presentation gate rejeita retorno de fonte/JS legado;
- build sempre limpa `dist/` antes do TypeScript;
- 178/178 testes + gates executáveis aprovados antes da publicação;
- browser smoke segue indisponível somente pelo timeout conhecido do Chromium headless em 12s.

Ainda não remover:
- `components/fields` e `components/sheets`, pois Ajustes/Onboarding ainda possuem consumidores reais;
- CSS residual, até auditoria específica de seletores/consumidores.

## Refinamento UX funcional — candidato 12.32
- feedback geral V0 substitui toast residual antigo;
- ação `Desfazer` permanece explícita e responsiva;
- seletores inline ganham radiogroup, Escape e retorno de foco;
- erros de formulário são anunciáveis;
- telas internas respeitam safe-area inferior;
- foco visível e `prefers-reduced-motion` protegidos;
- nenhuma mudança no Financial Core ou na arquitetura V0.

Checkpoint esperado após validação real: `UX-FUNCTIONAL-REFINEMENT-STABLE`.

## Próxima sequência
1. Validar 12.32 no iPhone e congelar `UX-FUNCTIONAL-REFINEMENT-STABLE`.
2. Identidade visual Orion.
