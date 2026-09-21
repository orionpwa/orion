# Auditoria 12.23

Objetivo: remover a coexistência de implementações visuais antigas e impedir regressão estrutural.

Autoridade visual: `src/presentation/`.
Entrypoint: `src/app/main.ts`.
Stylesheet: `styles/orion.css`.

O gate `presentation:check` falha se árvores/entrypoints visuais legados voltarem a existir.

Investimentos/Radar permanecem preservados no Core, mas a superfície visual continua adiada conforme decisão do produto.
