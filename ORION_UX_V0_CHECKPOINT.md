# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX do Orion. Quando houver conflito com layouts, documentação ou padrões visuais anteriores, esta base vence, salvo revisão explícita posterior.

## Base técnica preservada
- Branch: `main`.
- Shell V0 validado no iPhone e congelado como `UX-V0-BASELINE-STABLE`.
- Hotfix do rodapé validado: `ac4d8d256ac59ea2a384031f2c1e1321ef6ef037`.
- Resumo V0 validado no iPhone e congelado como `RESUMO-STABLE`.
- Movimentos V0 validado no iPhone e congelado como `MOVIMENTOS-STABLE`.
- Data schema: 5.
- Backup format: 2.
- Financial Core, IndexedDB, migrations e contratos financeiros permanecem preservados.

## Arquitetura V0 congelada
Raízes da navegação:
1. Resumo
2. Movimentos
3. Planejar
4. Contas

Ajustes é acessado por Resumo e não é uma quinta raiz.

## Shell V0 — STABLE
Estado: `UX-V0-BASELINE-STABLE`.

Regras permanentes:
- Bottom navigation somente nas quatro telas-raiz.
- Nenhum FAB global.
- `Novo` pertence a Movimentos.
- `Ajustes` pertence a Resumo.
- Telas internas escondem a bottom navigation e oferecem retorno explícito.
- Safe-area do iPhone é absorvida dentro da própria barra inferior.
- A barra inferior fica visualmente encostada à base da tela, sem faixa, vão ou fundo externo abaixo dela.
- Esse encaixe validado no PWA instalado não pode regredir em etapas futuras.
- Navegador comum pode usar viewport dinâmico; o PWA instalado deve preencher a altura física completa disponível.

## Princípios UX V0
- Mobile-first para iPhone.
- 320 px é largura mínima de stress test.
- Uma função deve ter um único lugar.
- Nada essencial depende de gesto oculto.
- Nada essencial é escondido em menus de três pontos.
- Sem truncamento por `...` em conteúdo financeiro importante.
- Linhas e blocos podem crescer verticalmente.
- Sem carrossel horizontal como estrutura principal.
- Sem sheets empilhadas para fluxos que crescem; preferir tela dedicada.
- Poucos cards e nenhuma complexidade de ERP.
- Branding, cores finais e identidade Orion ficam depois da estrutura funcional.

## Ordem da reconstrução
1. `UX-V0-BASELINE-STABLE` ✅
2. `RESUMO-STABLE` ✅
3. `MOVIMENTOS-STABLE` ✅
4. Planejar
5. Contas
6. Limpeza segura da infraestrutura visual antiga
7. Refinamento UX
8. Identidade visual Orion

## Resumo V0 — STABLE
Validado no iPhone em 12.26.
QA da fonte na etapa: 157/157 testes aprovados + todos os gates.

Estrutura preservada:
- Livre para decidir
- Disponível
- Compromissos
- Metas e reservas
- Este mês: Entrou / Saiu / Resultado, ou estado vazio do mês
- Próximos compromissos
- Estado vazio encaminha para Movimentos sem duplicar criação

Não fazem parte do Resumo:
- Disponível agora como hero legado
- status de conforto
- Próxima prioridade
- Contas rápidas
- CTA genérica de nova movimentação

## Movimentos V0 — STABLE
Estado: `MOVIMENTOS-STABLE`. Validado no iPhone em 12.27.
QA da fonte: 164/164 testes aprovados + quality, presentation, gateway, security precheck, PWA, public, operational, investments, radar, RC, device, privacy/release, Cloudflare e beta aprovados.
Browser smoke continua indisponível neste ambiente pelo timeout conhecido do Chromium headless em 12s; validação real no iPhone foi concluída.

Estrutura candidata:
- histórico e estado vazio
- `Novo` somente no topo da raiz Movimentos
- Despesa / Receita / Transferência em tela interna focada
- detalhe dedicado do movimento
- edição dedicada
- exclusão/desfazer explícitos
- filtros simples em tela dedicada
- sem busca permanente
- sem actions sheet como substituta de detalhe
- sem `<select>` nativo em fluxos críticos
- seletores inline dentro da própria tela, sem sheets empilhadas
- transferência apresentada como fato neutro
- bottom navigation somente na raiz Movimentos
- 320 px sem ellipsis protegido por teste

Proteções:
- Shell V0 e Resumo V0 não foram reabertos.
- Hotfix do rodapé do iPhone permanece congelado.
- Financial Core, IndexedDB schema 5, backup v2 e migrations não foram alterados.
- pacote final Cloudflare é montado e verificado pelo QA; todos os stylesheets referenciados pelo index precisam existir e estar no precache.

## Feedback de atualização V0 — candidato 12.28
Estado: `UPDATE-BANNER-CANDIDATE`, aguardando validação visual no iPhone.
QA da fonte: 166/166 testes aprovados + todos os gates executáveis. Browser smoke segue indisponível pelo timeout conhecido do Chromium headless em 12s.

Regras candidatas:
- O aviso de nova versão não usa mais o action-toast genérico.
- Banner compacto dedicado, sem cápsula gigante e sem truncamento.
- Texto padrão: `Atualização disponível`.
- Ação explícita: `Atualizar`.
- O banner permanece disponível até a ação, respeita safe-area e adapta a posição quando o dock está oculto.

Após validação real no iPhone, congelar como `UPDATE-BANNER-STABLE` e preservar nas próximas etapas.
