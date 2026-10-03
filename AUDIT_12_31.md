# Auditoria 12.31

Objetivo: remover apresentação legada sem consumidores, sem alterar a UX V0 aprovada ou o Financial Core.

Proteções:
- build limpa dist antes de compilar;
- presentation gate rejeita fontes e JS compilado legados;
- desativação ativa mantém undo auditável;
- Ajustes/Onboarding permanecem intactos enquanto dependem de fields/sheets;
- Core, dados, migrations, schema 5 e backup v2 preservados.
