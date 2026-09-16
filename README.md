# Orion Finance — pacote GitHub + Cloudflare Pages

Este é o pacote de publicação da Fase 12.19. O conteúdo que o Cloudflare deve servir está exclusivamente em `site/`.

## Configuração auditada

- Framework preset: **None**
- Production branch: **main**
- Build command: **exit 0**
- Build output directory: **site**
- Root directory: **deixar vazio**
- Environment variables: **nenhuma nesta fase**

Essa configuração foi escolhida após inspeção da stack real do Orion. O app não usa framework/bundler/SSR; o TypeScript é compilado previamente e o repositório de deploy recebe o runtime-only já validado.

Arquivos auxiliares na raiz (`README.md`, `CLOUDFLARE_AUDIT.md`, `CLOUDFLARE_PAGES_SETTINGS.txt`, `VERIFY_AFTER_DEPLOY.md`) não são publicados porque o output configurado é `site/`.
