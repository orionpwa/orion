# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX do Orion. Quando houver conflito com layouts, documentação ou padrões visuais anteriores, esta base vence, salvo revisão explícita posterior.

## Base técnica preservada
- Branch: `main`.
- Shell V0 validado no iPhone e congelado como `UX-V0-BASELINE-STABLE`.
- Hotfix do rodapé validado: `ac4d8d256ac59ea2a384031f2c1e1321ef6ef037`.
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
2. Resumo — `RESUMO-CANDIDATE` em 12.26, aguardando validação real no iPhone
3. Movimentos
4. Planejar
5. Contas
6. Limpeza segura da infraestrutura visual antiga
7. Refinamento UX
8. Identidade visual Orion

## Resumo V0 — candidato 12.26
QA da fonte: 157/157 testes aprovados + todos os gates.

Estrutura:
- Livre para decidir
- Disponível
- Compromissos
- Metas e reservas
- Este mês: Entrou / Saiu / Resultado
- Próximos compromissos
- Estado vazio encaminha para Movimentos sem duplicar criação

Não fazem mais parte do Resumo:
- Disponível agora como hero legado
- status de conforto
- Próxima prioridade
- Contas rápidas
- CTA genérica de nova movimentação

Checkpoint após validação real: `RESUMO-STABLE`.
