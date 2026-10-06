# Verificação após deploy — 12.48

1. Confirme `0.1.0-development.12.48` em Ajustes > Sobre o Orion.
2. Vá em Resumo > Mais recursos > Patrimônio > Ver investimentos.
3. Confirme que ações/FIIs/ETFs/BDRs já cadastrados continuam exibindo a mesma quantidade e custo.
4. Em `Adicionar investimento`, confirme a opção `Criptoativo`.
5. Cadastre BTC como criptoativo e registre uma compra de teste com quantidade fracionária, por exemplo `0,00080000`.
6. Confirme que a conta de liquidação diminui pelo valor bruto + taxas e que a compra não vira despesa de consumo.
7. Confirme que o detalhe do BTC preserva até 8 casas decimais.
8. Com `BRAPI_TOKEN` configurado no Cloudflare, toque em `Atualizar cotações` e confirme que o valor atual muda sem criar movimento financeiro.
9. Sem cotação disponível, confirme que a posição continua mostrada pelo custo.
10. Feche e reabra o PWA e confirme persistência, atualização e funcionamento normal das demais áreas.
