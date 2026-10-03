# Auditoria 12.28

Objetivo: corrigir o feedback visual de atualização sem alterar o Financial Core nem reabrir Shell, Resumo ou Movimentos.

Autoridade visual: `src/presentation/`.
Entrypoint: `src/app/main.ts`.
Feedback: `src/presentation/components/feedback.ts`.
Estilo dedicado: `styles/ux-v0-feedback.css`.

Regras protegidas:
- quatro raízes e somente quatro;
- dock apenas em telas-raiz;
- rodapé iPhone sem vão;
- Shell, Resumo e Movimentos estáveis;
- banner de atualização compacto, persistente e sem ellipsis;
- Core e persistência preservados.
