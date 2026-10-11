# Verificação final após deploy — Orion 0.1.0

Esta checagem usa apenas a base de teste. Não é necessário inserir movimentações, saldos ou documentos pessoais reais para validar o fechamento.

1. Em `Ajustes > Sobre o Orion`, confirme a versão `0.1.0` e execute `Verificar funcionamento`.
2. Feche e reabra o PWA. Confirme que abre normalmente, mantém a base de teste e não exibe versão antiga.
3. Percorra as cinco raízes do dock: Resumo, Movimentos, Planejar, Contas e Fiscal. Confirme destaque do item ativo, rolagem e ausência do dock nas telas internas.
4. Em `Ajustes > Privacidade`, confirme: dados locais, IA/telemetria não utilizadas, mercado desativado e nuvem desativada.
5. Em `Ajustes > Dados e backup`, faça `Criar backup financeiro` da base de teste. Não é necessário restaurá-lo. Se já houver documentos de teste, confirme também que `Fiscal > Documentos` mantém o backup documental separado.
6. Em Movimentos, abra `Novo` e volte sem salvar. Em Planejar e Contas, abra um formulário de criação e cancele. Isso valida navegação sem criar fatos financeiros.
7. Em Fiscal, abra Documentos, Preparação para IR, Informe de Rendimentos, Informes financeiros e Dossiê Fiscal. Não é necessário enviar documentos pessoais.
8. Ative modo avião e reabra o Orion. Resumo, Movimentos, Planejar, Contas, Ajustes e dados já armazenados devem continuar acessíveis. A leitura de um PDF novo pode exigir que PDF.js já tenha sido carregado anteriormente.
9. Volte à internet. Confirme que o app não solicita login e não apresenta sincronização em nuvem ou atualização automática de mercado.
10. Se todos os itens acima passarem, considere `0.1.0` fechada para uso pessoal e só abra nova versão para correção concreta ou necessidade futura deliberada.
