# Verificação após deploy — 12.46

1. Confirme `0.1.0-development.12.46` em Ajustes > Sobre o Orion.
2. Vá em Resumo > Mais recursos > Patrimônio > Ver investimentos.
3. Confirme que não existe Radar, score ou recomendação de compra.
4. Cadastre PETR4 como Ação B3 e, se quiser, uma posição pequena de teste.
5. Toque em `Atualizar cotações`; PETR4 deve receber valor de mercado mesmo sem token por ser símbolo sandbox da brapi.
6. Confirme que a cotação muda `Valor atual`/Patrimônio, mas não cria receita, despesa nem movimento bancário.
7. Confirme que uma posição sem fonte disponível continua mostrada pelo custo.
8. Após configurar `BRAPI_TOKEN`, valide um FII ou outro ticker B3 e BTC; após `ALPHAVANTAGE_API_KEY`, valide uma ação internacional.
9. Feche e reabra o PWA e confirme persistência, atualização e funcionamento normal das demais áreas.