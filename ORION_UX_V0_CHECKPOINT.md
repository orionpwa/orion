# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX do Orion. Em conflito com layouts/documentação antigos, esta base vence salvo revisão explícita.

## Base técnica
- Release candidata: `0.1.0-development.12.37`.
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
- `MARCA-V1-CANDIDATE` 🧪

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
- Arquitetura/fluxos V0 permanecem congelados durante a identidade visual.

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
- `components/fields` e `components/sheets`, pois Onboarding ainda possui consumidor real;
- CSS residual, até auditoria específica de seletores/consumidores.

## Refinamento UX funcional — STABLE
Validado no iPhone em 12.32.
- feedback geral V0 substitui toast residual antigo;
- ação `Desfazer` permanece explícita e responsiva;
- seletores inline têm radiogroup, Escape e retorno de foco;
- erros de formulário são anunciáveis;
- telas internas respeitam safe-area inferior;
- foco visível e `prefers-reduced-motion` protegidos.

## Ajustes V0 — STABLE
Validado no iPhone em 12.33.
- Ajustes fora do dock e pertencente a Resumo;
- Perfil, Dados e backup, Privacidade, Sobre o Orion e Recomeçar com uma base nova;
- telas dedicadas, sem sheets;
- backup, restauração, importação e reset seguro preservados;
- Aparência antiga não foi transportada para a V0.

## Identidade visual V1 — STABLE
Direção oficial candidata: **grafite profundo + azul safira frio**.
- identidade única, sem múltiplos temas nesta primeira entrega;
- sem estrelas, planetas ou gradientes decorativos;
- azul safira reservado para navegação ativa, links, foco e ações primárias;
- verde/vermelho usados somente como semântica financeira/estado;
- antigo motor de temas deixa de controlar o runtime, mas preferências salvas não são apagadas;
- theme/background do PWA passam a `#080b10`;
- identidade interna validada; marca V1 passa a usar anel + três barras ascendentes em grafite + safira;
- Core, schema 5, backup v2 e arquitetura V0 permanecem congelados.

Validado visualmente no iPhone em 12.34. `IDENTIDADE-V1-STABLE` ✅

## Marca V1 — candidato 12.36
- símbolo oficial: anel contínuo + três barras ascendentes;
- nome completo: Orion Finance; nome curto no dispositivo: Orion;
- Apple touch icon, favicon e PWA usam assets V1;
- ícones Rubi anteriores deixam de ser referenciados pelo runtime;
- fonte vetorial em `brand/orion-icon-v1-master.svg`;
- sem alteração em UX, Core ou persistência.

Checkpoint esperado após validação real: `MARCA-V1-STABLE`.


## Hotfix 12.37 — integridade da marca V1
- restaura no runtime os PNGs V1 validados, sem regenerar visualmente a marca;
- corrige o `purpose: maskable` para `assets/orion-icon-v1-maskable-512.png`;
- renova versão/cache PWA e regenera o `RELEASE_MANIFEST.json` a partir do artefato real;
- nenhuma alteração em UX, Financial Core, schema 5, backup v2, IndexedDB ou migrations.

## Próxima sequência
1. Validar 12.37 no iPhone e congelar `MARCA-V1-STABLE`.
2. Decidir se Aparência volta como controle da identidade oficial.
3. Fazer auditoria técnica final da V0 antes de novos recursos.
