# Auditoria 12.37

Objetivo: corrigir exclusivamente a integridade de publicação da marca V1 detectada após a 12.36.

Proteções:
- os cinco assets V1 validados são a fonte canônica do runtime;
- `orion-icon-v1-512.png` e `orion-icon-v1-maskable-512.png` são restaurados byte a byte a partir do pacote validado;
- os assets 64/180/192 permanecem inalterados;
- `manifest.webmanifest` passa a apontar `purpose: maskable` para a variante maskable real;
- `RELEASE_MANIFEST.json` é regenerado a partir do artefato efetivamente publicado;
- cache PWA é renovado para 12.37;
- UX, Financial Core, schema 5, backup v2, IndexedDB e migrations permanecem congelados.
