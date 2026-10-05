# Auditoria 12.38 — candidato de fechamento UX V0

Escopo publicado de forma conservadora:
- `MARCA-V1-STABLE` preservada após validação real no iPhone;
- identidade oficial permanece única, sem seletor de tema na V0;
- runtime antigo de Aparência deixa de ser inicializado pela aplicação;
- nomes residuais V3 em Resumo e instituições são normalizados para V0;
- artefatos visuais antigos sem efeito permanecem fisicamente preservados nesta candidata para evitar uma limpeza ampla antes do gate real;
- nenhuma preferência local antiga é apagada;
- Financial Core, domain, application financeira, data/IndexedDB, schema 5, backup v2 e migrations permanecem congelados.

QA da fonte candidata: 194/194 testes e gates executáveis aprovados. A publicação 12.38 é um delta conservador sobre a 12.37 e exige validação física no iPhone antes de `UX-V0-FINAL-STABLE`.
