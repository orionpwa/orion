# Auditoria 12.39 — cartões dentro de Contas

Escopo: expor a capacidade de cartão de crédito já existente no Financial Core sem alterar schema, backup ou regras financeiras.

Resultado:
- cartões inseridos como subárea de Contas;
- criar, editar, consultar e pagar cartão em telas internas dedicadas;
- compras permanecem exclusivamente em Movimentos > Novo;
- pagamento usa conta escolhida explicitamente, sem pré-seleção arbitrária;
- nenhuma nova raiz de navegação;
- roteamento da apresentação modularizado por área para manter o entrypoint enxuto, sem alterar comportamento financeiro;
- Core, IndexedDB schema 5, backup v2 e migrations preservados.

QA:
- 198/198 testes aprovados após a modularização;
- Quality, Presentation, Gateway, Security precheck, PWA, Public, Operational, Investment, Radar, RC, Device, Privacy/Release, Cloudflare e Beta gates aprovados;
- browser smoke automatizado continua indisponível somente pela limitação conhecida do Chromium headless no ambiente; validação física será feita no iPhone.
