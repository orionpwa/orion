# Primeiro update após a migração — 12.20

Esta versão corrige somente o ícone Rubi do PWA no iOS/Cloudflare.

Mudanças públicas esperadas em `site/`:
- assets com nomes `orion-icon-rubi-v2-*`;
- `index.html` apontando para o novo apple-touch-icon;
- `manifest.webmanifest` com os novos ícones;
- `service-worker.js` com cache da versão 12.20;
- `dist/app/version.js` em 0.1.0-development.12.20;
- `RELEASE_MANIFEST.json` regenerado.

Não houve alteração em Financial Core, IndexedDB, schema ou backup.
