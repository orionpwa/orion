# Orion Finance 12.31 — limpeza segura da apresentação

- Contas passa a `CONTAS-STABLE` após validação real no iPhone;
- remove código 12.24 sem consumidores da apresentação ativa;
- remove JS compilado órfão por meio de clean obrigatório antes do build;
- migra `Desfazer` de desativação para a UX V0 ativa antes de apagar o componente antigo;
- mantém Ajustes/Onboarding e suas sheets enquanto ainda têm consumidores reais;
- não altera Financial Core, schema, backup ou persistência.
