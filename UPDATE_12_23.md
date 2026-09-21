# Orion Finance 12.23 — limpeza definitiva da UI

A reconstrução UX Spec v1 passa a ser a única autoridade visual do projeto.

Removido:
- árvore `src/ui/` anterior;
- árvore `src/ui-v3/` temporária;
- entrypoint `main-v3`;
- CSS visual duplicado em múltiplos arquivos;
- artefatos compilados dessas árvores.

Mantido sem alteração de regra financeira:
- Financial Core;
- IndexedDB e schema;
- backup/restore;
- transações, dívidas e recorrências;
- património e regras de cartão;
- quatro instituições visuais aprovadas: Bradesco, Inter, Mercado Pago e Caju.

A camada visual atual vive exclusivamente em `src/presentation/`, entra por `src/app/main.ts` e usa `styles/orion.css`.
