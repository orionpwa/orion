# Auditoria 12.41 — Outros ativos

## Escopo
Expor a gestão de outros ativos dentro de Patrimônio sem criar nova raiz e sem alterar regras do Financial Core.

## Proteções verificadas
- Core financeiro, schema 5, backup v2 e migrations não foram alterados.
- `kind: guarantee` permanece fora da gestão genérica.
- Valor inicial não movimenta conta.
- Atualização de valor usa `asset-valuation` e registra somente a diferença.
- Edição usa gateway auditável.
- Desativação usa lifecycle auditável com `Desfazer`.
- Imports dos módulos alterados resolvem para arquivos existentes.
- JavaScript alterado passou em `node --check`.
- Service worker mantém a mesma lista de runtime e apenas renova o cache para 12.41.

## Teste real necessário
Validar no iPhone: criar ativo, editar nome, atualizar valor, verificar PL e desativar/desfazer.
