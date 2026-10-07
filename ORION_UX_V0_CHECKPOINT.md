# Orion UX V0 - Checkpoint mestre

## Autoridade
Este arquivo é a fonte de recuperação da UX e da evolução pós-V0 do Orion. Em conflito com documentação antiga, esta base vence salvo revisão explícita.

## Base técnica atual
- Release atual: `0.1.0-development.12.63`.
- Financial Core preservado.
- IndexedDB financeiro permanece no schema 5.
- Backup financeiro permanece no formato v2.
- Database financeiro: `orion_finance_v01_rebuild`.
- Produção via Cloudflare Pages a partir de `main`, diretório `site/`.
- Documentos e Fiscal usam armazenamento documental separado do Financial Core.
- Backup documental evoluiu até v3 na 12.63, preservando compatibilidade com formatos documentais anteriores.

## Checkpoints estáveis e decisões consolidadas
- `UX-V0-FINAL-STABLE` ✅
- `CARTOES-CONTAS-STABLE` ✅
- `PATRIMONIO-LEITURA-STABLE` ✅
- `OUTROS-ATIVOS-STABLE` ✅
- `SITUACAO-MES-STABLE` ✅
- `FOCO-RESERVA-DIVIDAS-STABLE` ✅
- `RESERVA-SIMPLES-DIVIDAS-PROGRESSO-STABLE` ✅
- `SIMULACAO-QUITACAO-STABLE` ✅

## Arquitetura de navegação
### V0 congelada
A arquitetura V0 consolidou quatro raízes principais:
- Resumo
- Movimentos
- Planejar
- Contas

Regras congeladas:
- Ajustes pertence a Resumo.
- Nenhum FAB global.
- Telas internas e formulários escondem o dock quando apropriado.
- `Novo` pertence a Movimentos.
- Uma função deve ter um único lugar principal na arquitetura.
- Ações importantes não devem depender de menus obscuros ou empilhamento de sheets.

### Evolução na 12.60
A partir da 12.60, Fiscal tornou-se a quinta raiz do Orion.

Dock atual:
1. Resumo
2. Movimentos
3. Planejar
4. Contas
5. Fiscal

O dock usa o padrão flutuante em cápsula. Os ícones atuais foram refinados na 12.62 e fazem parte do baseline visual da 12.63.

## Direção atual do produto
Orion é um controlador financeiro pessoal e patrimonial. Ele registra fatos, planejamento, patrimônio e evidências documentais/fiscais sem transformar esses dados em recomendação financeira automática.

Pertence ao Orion:
- contas, saldos e movimentos;
- cartões, compromissos, dívidas, metas e reservas;
- patrimônio líquido e outros ativos;
- investimentos como posição patrimonial quando essa frente estiver ativa;
- documentos financeiros pessoais;
- preparação e organização fiscal;
- cotações, quando habilitadas, apenas para atualizar valor patrimonial.

Não pertence ao Orion:
- recomendação de compra;
- ranking de ativos;
- score fundamentalista;
- screener para decidir o que comprar;
- transformar briefing de mercado em recomendação automática.

O experimento de Radar da 12.45 foi explicitamente retirado na 12.46. O Orion permanece ferramenta de controle, não de recomendação.

## Prioridade operacional atual
1. manter o essencial sob controle;
2. formar a reserva mínima;
3. quitar dívidas;
4. fortalecer a reserva;
5. somente depois retomar investimentos como frente ativa.

A experiência deve acompanhar essa fase real e evitar abrir módulos sem necessidade concreta.

## Linha consolidada 12.38 -> 12.63
### 12.38 - UX V0 Final Stable
- consolida Resumo, Movimentos, Planejar e Contas;
- congela a arquitetura principal de navegação e as regras de simplicidade da UX.

### 12.39 - Cartões dentro de Contas
- cartões de crédito passam a pertencer à raiz Contas.

### 12.40 - Patrimônio em leitura
- patrimônio entra inicialmente em modo de leitura, sem duplicar funções de contas ou movimentos.

### 12.41 - Outros ativos
- outros ativos passam a integrar o patrimônio com ciclo próprio de registro e acompanhamento.

### 12.42 - Situação do mês
- Resumo passa a expor a situação mensal de forma integrada à leitura financeira.

### 12.43 e 12.44 - Investimentos
- investimentos entram primeiro em leitura e depois ganham cadastro, compra e venda;
- compra troca caixa por patrimônio e não representa despesa de consumo.

### 12.45 - Radar experimental
- foi criada uma experiência de Radar fundamentalista;
- esta direção não foi aceita como parte permanente do produto.

### 12.46 e 12.46.1 - Retorno ao controle financeiro
- Radar e fundamentos são retirados da experiência;
- investimento volta a ser tratado somente como posição patrimonial;
- cotação altera valor patrimonial sem criar movimento de caixa;
- 12.46.1 corrige a rota funcional de Patrimônio após regressão.

### 12.47 - Cotações B3
- atualização manual de cotações é restaurada de forma mínima e segura.

### 12.48 - Cripto como patrimônio
- criptoativos passam a ser controláveis em BRL, com precisão de até 8 casas decimais.

### 12.49 - Foco em reserva e dívidas
- carteira e mercado saem do uso normal;
- dados antigos de investimento permanecem preservados;
- Patrimônio, contas, cartões, compromissos, dívidas, metas e reservas continuam ativos.

### 12.50 - Progresso de metas e reservas
- objetivos passam a mostrar percentual, valor restante e estado de conclusão.

### 12.51 - Reserva simples e progresso de dívidas
Reservas:
- todo valor reservado fica automaticamente fora do Livre;
- reservar não cria movimentação bancária e não altera o saldo real da conta;
- objetivo mostra percentual, progresso e valor restante.

Dívidas:
- lista e detalhe mostram progresso da quitação;
- pagamentos são os únicos eventos que reduzem o saldo da dívida;
- oferta de quitação pode mostrar economia potencial sem recomendação automática.

### 12.52 - Simulação de quitação
- `Planejar > Dívidas > detalhe` possui simulação de quitação;
- usa saldo restante, pagamento mensal e juros informados pelo usuário;
- mostra prazo, total pago e juros estimados;
- não cria pagamento, não movimenta conta, não altera dívida e não persiste plano.

### 12.53 - Personal Ready
Objetivo: encerrar o bloco funcional anterior e permitir transição segura da base de testes para uso pessoal real.

Marco zero:
1. cadastrar contas ativas com saldo real atual;
2. cadastrar reserva mínima e valor efetivamente reservado;
3. cadastrar dívidas ativas pelo saldo atual em aberto;
4. cadastrar compromissos recorrentes com efeito futuro;
5. registrar receitas, despesas, transferências e pagamentos somente a partir desse marco.

O histórico anterior não é requisito para o Orion ficar correto daqui para frente.

### 12.54 - Identidade visual
- corrige regressão visual do onboarding e do Resumo;
- restaura a identidade oficial grafite + safira sem alterar regras financeiras.

### 12.55 - Recomeço simplificado
- a interface deixa de prometer explicitamente backup no texto da ação;
- `Recomeçar com uma base nova` permanece separado de `Dados e backup`;
- o comportamento interno de segurança do fluxo é preservado.

### 12.56 - Orion Base
O Resumo passa a refletir a fase financeira pessoal com prioridade para:
- Livre para gastar;
- fase atual;
- Protegido;
- Comprometido;
- Dívidas;
- Disponível;
- situação do mês;
- próximo passo.

Identidade visual: grafite + safira + dourado de progresso.

### 12.57 - Documentos e holerites
- nasce a área Documentos;
- leitura local de holerites em PDF;
- revisão antes do arquivamento;
- armazenamento documental separado do Financial Core;
- documentos não alteram saldos, receitas ou despesas automaticamente.

### 12.58 - Backup documental
- Documentos ganha backup e restauração portáteis;
- PDFs originais podem acompanhar o backup documental;
- backup documental permanece separado do backup financeiro v2.

### 12.59 - Preparação anual para IR
- holerites arquivados passam a alimentar visão anual preparatória;
- consolida rendimentos, descontos, INSS, IRRF, líquido e FGTS;
- exporta CSV;
- não determina obrigatoriedade fiscal nem substitui Informe de Rendimentos.

### 12.60 - Fiscal como quinta raiz
- Fiscal entra no dock como quinta raiz;
- Documentos e preparação para IR passam a ser organizados dentro dessa área;
- nasce a Central Fiscal e o Dossiê Fiscal anual;
- dock passa ao padrão flutuante em cápsula.

### 12.61 - Informe de Rendimentos
- leitura local do Informe de Rendimentos anual em PDF;
- armazenamento documental separado;
- revisão manual antes de salvar;
- conciliação com holerites do mesmo ano para rendimentos, INSS e IRRF;
- diferenças são sinalizadas para revisão, não tratadas automaticamente como erro.

### 12.62 - Benefícios, Premiação e ícones do dock
Caju:
- Caju é tratada no Orion como benefício/VA restrito;
- aparece separada no Resumo quando houver saldo;
- não entra em Disponível nem em Livre para gastar;
- cadastro/edição preservam essa semântica restrita.

Premiação:
- Premiação existe como categoria de receita;
- o valor só entra no Orion como dinheiro livre quando for efetivamente transferido para uma conta bancária e registrado como receita `Premiação`;
- a premiação não deve ser misturada ao saldo de VA da Caju dentro do Orion.

Dock:
- Resumo: casa simplificada;
- Movimentos: fluxo com duas setas horizontais;
- Planejar: calendário com marcação;
- Contas: instituição bancária;
- Fiscal: documento com marcação;
- mesma linguagem visual e espessura entre os cinco ícones.

### 12.63 - Informes financeiros e posição fiscal
- Fiscal passa a ler e arquivar informes anuais de instituições financeiras;
- foco inicial em Bradesco e Inter;
- extrai para revisão: ano-calendário, instituição, CNPJ, posição em 31/12, rendimentos e IRRF;
- esses dados são evidência fiscal histórica;
- não alteram saldo atual, movimentos ou patrimônio;
- entram no Dossiê Fiscal;
- backup documental evolui para v3 com compatibilidade de restauração dos formatos documentais anteriores;
- Financial Core, schema financeiro 5 e backup financeiro v2 permanecem inalterados.

## Baseline visual e funcional atual: 12.63
O estado físico validado no iPhone em 12.63 é a referência para próximas mudanças de UX.

### Resumo
- hero `Livre para gastar`;
- cartão `Sua fase atual`;
- métricas Protegido, Comprometido, Dívidas e Disponível;
- benefícios aparecem separadamente quando existirem;
- Ajustes acessível pelo topo.

### Movimentos
- título central;
- `Novo` no topo;
- filtros próprios;
- estado vazio simples quando ainda não houver movimentos.

### Planejar
- Compromissos;
- Dívidas;
- Metas e reservas.

### Contas
- contas bancárias;
- cartões de crédito na mesma raiz, em seção separada;
- criação/edição em telas internas sem dock.

### Fiscal
- quinta raiz estrutural;
- centraliza Documentos, preparação anual, Informe de Rendimentos, informes financeiros e Dossiê Fiscal.

### Ajustes
- Perfil;
- Dados e backup;
- Privacidade;
- Sobre o Orion;
- Recomeçar com uma base nova.

## Fronteiras que não devem regredir
- movimentação é fato; planejamento é previsão;
- transferência entre contas não altera patrimônio líquido;
- reserva reduz o Livre, mas não reduz o saldo real da conta;
- pagamento é o evento que reduz dívida;
- simulação nunca deve virar fato financeiro;
- cotação, quando usada, altera valor patrimonial, não caixa;
- documento fiscal não altera saldo atual automaticamente;
- benefício restrito não entra no dinheiro livre;
- Fiscal organiza evidências e preparação, não decide sozinho obrigação tributária;
- investimentos não devem voltar ao uso normal antes de a prioridade financeira real justificar essa frente.

## Próxima sequência
1. Tratar `12.63` como baseline oficial de recuperação.
2. Não reabrir decisões V0 já congeladas sem necessidade observada no uso real.
3. Validar no iPhone os fluxos da quinta raiz Fiscal conforme documentos reais forem sendo adicionados.
4. Continuar o marco zero pessoal apenas com dados atuais e futuros, sem reconstrução histórica obrigatória.
5. Refinar UX somente quando o uso real revelar atrito concreto.
6. Qualquer 12.64 deve partir deste checkpoint e preservar Financial Core, schema 5, backup financeiro v2 e as fronteiras acima, salvo mudança deliberada e documentada.
