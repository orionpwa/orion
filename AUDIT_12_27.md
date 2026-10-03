# Auditoria 12.27

Objetivo: migrar o fluxo vertical de Movimentos para UX V0 sem alterar o Financial Core.

Autoridade visual: `src/presentation/`.
Entrypoint: `src/app/main.ts`.
Shell estável: `src/presentation/shell.ts`.
Estilos V0: `styles/ux-v0-*.css`.

Regras protegidas:
- quatro raízes e somente quatro;
- dock apenas em telas-raiz;
- rodapé iPhone sem vão;
- sem FAB global;
- sem busca permanente em Movimentos;
- sem sheets empilhadas no fluxo V0;
- Core e persistência preservados.
