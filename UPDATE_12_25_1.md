# Orion Finance 12.25.1 — UX V0 Shell Viewport Fix

- corrige o encaixe inferior do Shell V0 no PWA instalado no iPhone;
- mantém `100dvh` no navegador comum;
- usa altura física completa no modo standalone;
- mantém `safe-area-inset-bottom` dentro da barra inferior;
- nenhuma alteração no Financial Core, IndexedDB, schema, backup ou migrations;
- adiciona teste de regressão para impedir o retorno da faixa vazia sob o dock.

QA da fonte: 156/156 testes aprovados. Browser smoke segue indisponível neste ambiente pela limitação conhecida do Chromium headless.
