# Orion Finance — Update 12.48

- Criptoativos entram como patrimônio, sem Radar ou recomendação.
- Cadastro usa mercado `CRYPTO` e valores de compra/venda continuam em BRL.
- Novos criptoativos usam precisão de 8 casas decimais; instrumentos antigos preservam a escala anterior de 6 casas.
- Compra reduz a conta de liquidação e vira posição patrimonial; venda devolve o líquido à conta.
- Cotação altera somente o valor atual e o patrimônio, sem criar receita, despesa ou movimento bancário.
- A cotação automática de cripto depende de `BRAPI_TOKEN` configurado apenas no Cloudflare Pages.
- Sem cotação, o Orion mantém a posição pelo custo.
- IndexedDB schema 5, backup v2 e banco permanecem inalterados.
