# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX do Orion. Em conflito com layouts/documentação antigos, esta base vence salvo revisão explícita.

## Base técnica
- Release estável: `0.1.0-development.12.38`.
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
- `UX-FUNCTIONAL-REFINEMENT-STABLE` ✅
- `AJUSTES-STABLE` ✅
- `IDENTIDADE-V1-STABLE` ✅
- `MARCA-V1-STABLE` ✅
- `APARENCIA-LEGACY-REMOVED` ✅
- `UX-V0-FINAL-STABLE` ✅

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
- browser smoke segue indisponível somente pelo timeout conhecido do Chromium headless em 12s.

Preservar:
- `components/fields` e `components/sheets`, pois Onboarding ainda possui consumidor real.

Auditoria 12.38:
- CSS residual de Aparência/V3 sem consumidores reais removido;
- motor legado de temas removido do runtime;
- preferências antigas já gravadas não são apagadas;
- `prefers-reduced-motion` permanece protegido pela camada V0.

## Ajustes V0 — STABLE
- Ajustes fora do dock e pertencente a Resumo;
- Perfil, Dados e backup, Privacidade, Sobre o Orion e Recomeçar com uma base nova;
- telas dedicadas, sem sheets;
- backup, restauração, importação e reset seguro preservados;
- Aparência antiga não faz parte da UX V0.

## Identidade visual e Marca V1 — STABLE
- grafite profundo + azul safira frio;
- identidade única, sem múltiplos temas nesta entrega;
- sem estrelas, planetas ou gradientes decorativos;
- azul safira reservado para navegação ativa, links, foco e ações primárias;
- verde/vermelho somente como semântica financeira/estado;
- símbolo oficial: anel contínuo + três barras ascendentes;
- nome completo: Orion Finance; nome curto no dispositivo: Orion;
- Apple touch icon, favicon e PWA usam assets V1;
- fonte vetorial em `brand/orion-icon-v1-master.svg`.

Identidade validada no iPhone em 12.34. Marca V1 validada após reinstalação do PWA em 12.37.

## Fechamento UX V0 — 12.38
- 12.38 validada para avanço ao próximo estágio;
- `UX-V0-FINAL-STABLE` congelado;
- nenhuma mudança futura deve reabrir arquitetura, identidade ou fluxos V0 incidentalmente;
- novos trabalhos entram como escopo funcional explícito, com impacto delimitado e preservação dos checkpoints estáveis;
- Financial Core, schema 5, backup v2, IndexedDB e migrations permanecem protegidos.

## Próxima sequência
1. Definir o primeiro novo escopo funcional pós-V0.
2. Implementar de forma incremental, preservando a base `UX-V0-FINAL-STABLE`.
3. Só alterar Core ou persistência quando o novo recurso realmente exigir e após auditoria específica.
