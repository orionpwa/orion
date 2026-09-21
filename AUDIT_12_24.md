# Auditoria 12.24

Objetivo: fidelidade simultânea às responsabilidades funcionais e à UX Spec v1.

Autoridade visual: `src/presentation/`.
Entrypoint: `src/app/main.ts`.
Stylesheet: `styles/orion.css`.

Regras auditadas:
- Home informa e não administra;
- Mov. é a única proprietária do histórico e possui filtros;
- Planejar não repete o dashboard da Home;
- Contas administra contas;
- Configurações ficam no avatar e não ocupam a navegação principal;
- nenhuma árvore visual legada é permitida.
