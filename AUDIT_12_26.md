# Auditoria 12.26

Objetivo: migrar somente a raiz Resumo para a UX V0, preservando Shell V0 e Core financeiro.

Autoridade visual: src/presentation/.
Entrypoint: src/app/main.ts.
Shell estável: src/presentation/shell.ts + styles/ux-v0-shell.css.
Resumo V0: src/presentation/home.ts + styles/ux-v0-summary.css.

Regras protegidas:
- quatro raízes e somente quatro;
- barra inferior sem vão externo no PWA instalado;
- criação genérica de movimento pertence a Movimentos;
- Resumo não gerencia contas nem cria movimentações;
- sem visual legado da Home 12.24;
- Core e persistência preservados.
