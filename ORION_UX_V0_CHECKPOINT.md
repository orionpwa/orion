# Orion UX V0 — Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da reconstrução UX do Orion. Quando houver conflito com layouts, documentação ou padrões visuais anteriores, esta base vence, salvo revisão explícita posterior.

## Base técnica preservada
- Publicação atual: Orion 12.25
- Branch: `main`
- Shell V0 publicado a partir de `94ee56674a59e245e56d61cbf0083e43f2bd7cf4`
- Hotfix do rodapé validado no iPhone: `ac4d8d256ac59ea2a384031f2c1e1321ef6ef037`
- Data schema: 5
- Backup format: 2
- Financial Core, IndexedDB, migrations e contratos financeiros permanecem preservados.
- QA da fonte após o hotfix: 156/156 testes aprovados.

## Arquitetura V0 congelada
Raízes da navegação:
1. Resumo
2. Movimentos
3. Planejar
4. Contas

Ajustes é acessado por Resumo e não é uma quinta raiz.

## Shell V0 — STABLE
Estado: `UX-V0-BASELINE-STABLE`

Regras permanentes:
- Bottom navigation somente nas quatro telas-raiz.
- Nenhum FAB global.
- `Novo` pertence a Movimentos.
- `Ajustes` pertence a Resumo.
- Telas internas escondem a bottom navigation e oferecem retorno explícito.
- Safe-area do iPhone deve ser absorvida dentro da própria barra inferior.
- A barra inferior deve ficar visualmente encostada à base da tela, sem faixa, vão ou fundo externo abaixo dela.
- O comportamento validado no PWA instalado não pode regredir em etapas futuras.
- O navegador comum pode usar viewport dinâmico; o PWA instalado deve preencher a altura física completa disponível.

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
2. Resumo
3. Movimentos
4. Planejar
5. Contas
6. Limpeza segura da infraestrutura visual antiga
7. Refinamento UX
8. Identidade visual Orion

## Próxima etapa
`RESUMO`

Objetivo: reconstruir a raiz Resumo sobre o Shell V0 estável, sem alterar Financial Core, persistência ou as demais raízes.

Estrutura funcional prevista:
- Livre para decidir
- Disponível
- Compromissos
- Metas e reservas
- Este mês: Entrou / Saiu / Resultado
- Próximos compromissos
- Estado vazio sem CTA duplicada de criação

Checkpoint esperado após validação real: `RESUMO-STABLE`.
