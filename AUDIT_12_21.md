# Orion Finance 12.21 — Auditoria UX v2 / Cloudflare

## Baseline
- Origem: Source 12.20 Icon Fix / Cloudflare Ready.
- Estratégia: nova camada de UI em arquivos paralelos (`src/ui/v2/`, `styles/ux-v2.css`, `src/app/main-v2.ts`).
- A UI anterior permanece no código-fonte como fallback; o `index.html` aponta para `main-v2.js`.

## Integridade do motor
Comparação SHA-256 contra a 12.20:
- alterações em `src/domain/`: 0
- alterações em `src/application/`: 0
- alterações em `src/data/`: 0
- alterações em `src/migration/`: 0
- alterações em `gateway/`: 0

Financial Core, schema 5, backup v2, IndexedDB e regras patrimoniais permanecem intactos.

## Pontos críticos tratados
1. Dock mobile novo, mais compacto e com compensação visual da safe-area do iOS.
2. Aba Contas removida da navegação principal; `Ver todas` abre gerenciador em sheet.
3. Home exibe apenas contas com saldo diferente de zero.
4. Catálogo visual com 30 instituições de alta presença no mercado brasileiro, mais Caju e fallback custom.
5. Ícones semânticos para categorias e tipos de movimentação.
6. Cabeçalho v2 com hierarquia inspirada na densidade do Uno, preservando identidade Orion.
7. Aviso Offline em cápsula premium no topo e temporário.
8. Estabilização de efeitos WebKit ao entrar em segundo plano para melhorar preview no app switcher.
9. Temas em caixas compactas nas Configurações.
10. Ícone Rubi PWA full-bleed da 12.20 preservado.

## QA executado
- TypeScript build: aprovado.
- 149/149 testes: aprovados.
- Quality gate: aprovado.
- Gateway syntax: aprovado.
- Security precheck: aprovado (não substitui Semgrep).
- PWA gate: aprovado.
- Public readiness: aprovado.
- Operational integrity: aprovado.
- Investment integrity: aprovado.
- Radar integrity: aprovado.
- RC readiness: aprovado.
- Device readiness: aprovado.
- Privacy/release: aprovado.
- UX v2 readiness: aprovado.
- Cloudflare readiness: aprovado.
- Beta readiness: aprovado.
- Browser smoke automatizado: indisponível neste ambiente porque Chromium headless não encerra em 12s. O teste físico no iPhone continua obrigatório para os três pontos críticos: dock, app switcher e aparência visual.
