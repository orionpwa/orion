# Orion Finance — Cloudflare Pages — 12.53

Orion Finance v0.1 — Fase 12.53 Personal Ready. A fase ativa continua focada em reserva e dívidas, com carteira de investimentos e mercado desativados. A 12.52 de simulação de quitação foi congelada como estável e o fluxo de `Recomeçar com uma base nova` foi revisado para a transição dos dados de teste para uma base financeira real: o Orion cria e baixa um backup antes da substituição local, reabre o onboarding e permite começar pelos saldos atuais, sem exigir reconstrução do histórico anterior.

Configuração:
- Framework: **None**
- Build command: **exit 0**
- Build output directory: **site**
- Production branch: **main**
- Pages Functions: diretório **functions/** na raiz do projeto

Financial Core, IndexedDB schema 5, backup v2 e migrations permanecem preservados.

A sequência oficial de entrada em uso pessoal está documentada em `PERSONAL_READY.md`.
