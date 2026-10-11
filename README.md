# Orion Finance — 0.1.0 pessoal estável

Orion é um PWA local-first de controle financeiro, patrimonial e organização fiscal para uso pessoal. A versão 0.1.0 fecha o ciclo de desenvolvimento iniciado na Fase 12 e parte do baseline 12.63.

## Escopo ativo

- Resumo com Livre para gastar, fase atual, valores protegidos/comprometidos, dívidas e disponível.
- Movimentos: receitas, despesas e transferências.
- Planejar: compromissos, dívidas, metas e reservas.
- Contas e cartões de crédito.
- Patrimônio e outros ativos, sem recomendação de investimento.
- Fiscal: holerites, preparação anual, Informe de Rendimentos, informes financeiros e Dossiê Fiscal.
- Backup/restauração local e recomeço seguro da base.

## Privacidade

Os dados financeiros permanecem no dispositivo. Não há login, sincronização em nuvem, analytics de comportamento ou envio de dados financeiros/documentos a serviços de IA. O gateway de mercado está desativado na versão pessoal 0.1.0. A leitura de PDF é feita no navegador; a biblioteca PDF.js é obtida do CDN na primeira utilização quando ainda não estiver disponível.

## Base técnica congelada

- Financial Core preservado.
- IndexedDB financeiro: schema 5.
- Backup financeiro: formato v2.
- Documentos: banco v3 e backup documental v3.
- Database financeiro: `orion_finance_v01_rebuild`.
- Produção: Cloudflare Pages, branch `main`, diretório `site/`.
- Framework: nenhum; build command `exit 0`.

O histórico de decisões e fronteiras está em `ORION_UX_V0_CHECKPOINT.md`. A checagem manual final está em `VERIFY_AFTER_DEPLOY.md`.
