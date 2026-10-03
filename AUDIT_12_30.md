# Auditoria 12.30 — Contas V0

Escopo: apresentação, roteamento interno e testes da área Contas.

Não alterados:
- `src/domain/`
- `src/data/`
- `src/migration/`
- contratos financeiros do Core
- schema 5
- backup v2

Regras protegidas:
- Contas é a única área de gestão de contas;
- criação, detalhe e edição usam telas dedicadas;
- detalhe mostra movimentações da conta, mas o histórico completo continua pertencendo a Movimentos;
- nenhum atalho duplicado para Receita, Despesa ou Transferência;
- saldo inicial não é editável após criação;
- desativação preserva fatos existentes;
- sem sheets empilhadas, três pontos, select nativo ou ellipsis;
- 320 px protegido.

Gates obrigatórios antes da publicação: TypeScript, quality, presentation, testes, security precheck, PWA, public, operational, investment, radar, RC, device, privacy/release, release prepare, Cloudflare e beta.

Resultado: 178/178 testes aprovados; todos os gates executáveis aprovados; comparação contra 12.29 confirmou zero alterações em `src/domain`, `src/data`, `src/migration` e `src/application`. Browser smoke segue indisponível apenas pelo timeout conhecido do Chromium headless em 12s.
