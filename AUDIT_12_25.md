# Auditoria 12.25

Objetivo: estabelecer o Shell V0 sem reconstruir simultaneamente telas financeiras.

Autoridade visual: `src/presentation/` no pacote-fonte auditado.
Entrypoint publicado: `site/dist/app/main.js`.
Shell publicado: `site/dist/presentation/shell.js`.

Stylesheets de publicação:
- `site/styles/orion.css`: telas 12.24 ainda não migradas;
- `site/styles/ux-v0-shell.css`: Shell V0 isolado.

Regras protegidas:
- quatro raízes e somente quatro;
- criação genérica de movimento pertence a Movimentos;
- Ajustes não é raiz;
- dock apenas em telas-raiz;
- sem FAB global;
- Core e persistência preservados.

QA do pacote-fonte: 155/155 testes, demais gates aprovados. Browser smoke permanece fora deste gate pela limitação conhecida do ambiente.
