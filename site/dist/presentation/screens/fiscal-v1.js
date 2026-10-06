import { listPayslips, listIncomeReports } from '../../data/documents/database.js';
import { availableTaxYears, buildAnnualTaxPreparation } from '../../application/documents/annual-tax-summary.js';
import { formatBRL } from '../../domain/money/money.js';
import { el } from '../dom.js';
import { downloadTextFile } from '../download.js';

function availableFiscalYears(payslips, reports) {
    const years = new Set(availableTaxYears(payslips, new Date().getFullYear()));
    for (const report of reports) {
        if (Number.isInteger(report.year))
            years.add(report.year);
    }
    return [...years].sort((left, right) => right - left);
}

function currentTaxYear(payslips, reports) {
    return availableFiscalYears(payslips, reports)[0];
}

function metric(label, value, support) {
    return el('div', 'fiscal-metric-v1', [
        el('span', '', [label]),
        el('strong', '', [value]),
        el('small', '', [support])
    ]);
}

function actionCard(title, support, onClick, badge = '') {
    const children = [
        el('div', 'fiscal-action-copy-v1', [
            el('strong', '', [title]),
            el('span', '', [support])
        ])
    ];
    if (badge)
        children.push(el('span', 'fiscal-action-badge-v1', [badge]));
    children.push(el('span', 'fiscal-action-chevron-v1', ['›']));
    const button = el('button', 'fiscal-action-v1', children);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
}

function statusRow(title, support, status, tone = '') {
    return el('div', `fiscal-status-row-v1 ${tone}`.trim(), [
        el('span', 'fiscal-status-dot-v1'),
        el('div', 'fiscal-status-copy-v1', [
            el('strong', '', [title]),
            el('small', '', [support])
        ]),
        el('span', 'fiscal-status-value-v1', [status])
    ]);
}

function dossierText(summary, counts, incomeReports) {
    const lines = [
        `ORION FINANCE — DOSSIÊ FISCAL DE PREPARAÇÃO ${summary.year}`,
        '',
        'Este arquivo organiza dados conhecidos pelo Orion. Não substitui a declaração, o informe de rendimentos nem a conferência das regras vigentes.',
        '',
        'RENDIMENTOS DO TRABALHO',
        `Holerites arquivados: ${summary.documentCount}`,
        `Informes anuais arquivados: ${incomeReports}`,
        `Rendimentos brutos: ${formatBRL(summary.totals.grossEarnings)}`,
        `INSS descontado: ${formatBRL(summary.totals.inssDiscount)}`,
        `IRRF retido: ${formatBRL(summary.totals.irrfDiscount)}`,
        `Líquido registrado: ${formatBRL(summary.totals.netPay)}`,
        `FGTS informado: ${formatBRL(summary.totals.fgtsValue)}`,
        '',
        'MAPA PATRIMONIAL ATUAL',
        `Contas cadastradas: ${counts.accounts}`,
        `Dívidas cadastradas: ${counts.debts}`,
        `Outros ativos cadastrados: ${counts.assets}`,
        '',
        'PENDÊNCIAS PARA UM DOSSIÊ COMPLETO',
        '- Informes anuais das instituições financeiras',
        '- Posições de bens, direitos e dívidas nas datas exigidas pela declaração',
        '- Despesas dedutíveis e outros rendimentos, quando existirem',
        '- Conferência das regras e limites do exercício correspondente'
    ];
    if (incomeReports === 0)
        lines.splice(lines.indexOf('PENDÊNCIAS PARA UM DOSSIÊ COMPLETO') + 1, 0, '- Informe de Rendimentos anual da fonte pagadora');
    return lines.join('\n');
}

export async function renderFiscalV1(context, actions) {
    const [payslips, reports, accounts, debts, assets] = await Promise.all([
        listPayslips(context.profile.id),
        listIncomeReports(context.profile.id),
        context.repositories.accounts.listByProfile(context.profile.id),
        context.repositories.debts.listByProfile(context.profile.id),
        context.repositories.assets.listByProfile(context.profile.id)
    ]);
    const year = currentTaxYear(payslips, reports);
    const summary = buildAnnualTaxPreparation(payslips, year);
    const reportsForYear = reports.filter((item) => item.year === year);
    const activeAccounts = accounts.filter((item) => !item.deactivatedAt).length;
    const activeDebts = debts.filter((item) => !item.deactivatedAt).length;
    const activeAssets = assets.filter((item) => !item.deactivatedAt).length;

    const root = el('div', 'fiscal-screen-v1');
    root.append(el('section', 'fiscal-hero-v1', [
        el('span', 'fiscal-kicker-v1', ['CENTRAL FISCAL']),
        el('strong', '', ['Preparação contábil do seu ano']),
        el('p', '', ['Organize documentos, confira rendimentos e monte um dossiê antes da declaração. O Orion prepara e audita os dados conhecidos, sem decidir sozinho sua obrigação fiscal.'])
    ]));

    root.append(el('div', 'fiscal-metrics-v1', [
        metric('Ano-calendário', String(year), `${summary.documentCount} holerite(s) arquivado(s)`),
        metric('Rendimentos brutos', formatBRL(summary.totals.grossEarnings), 'Somados a partir dos holerites'),
        metric('IRRF retido', formatBRL(summary.totals.irrfDiscount), 'Valor identificado nos documentos')
    ]));

    root.append(el('section', 'fiscal-section-v1', [
        el('h2', '', ['Ferramentas']),
        actionCard('Dossiê fiscal anual', 'Mapa do que já está documentado e do que ainda falta preparar.', actions.onOpenDossier),
        actionCard('Informe de Rendimentos', 'Leia o PDF anual e concilie com os holerites do mesmo ano.', actions.onOpenIncomeReports, 'NOVO'),
        actionCard('Preparação para IR', 'Consolidação anual de holerites, empregadores e valores.', actions.onOpenIr),
        actionCard('Documentos', 'Holerites, PDFs originais e backup documental.', actions.onOpenDocuments)
    ]));

    root.append(el('section', 'fiscal-section-v1', [
        el('h2', '', ['Situação da documentação']),
        statusRow('Holerites', summary.documentCount > 0 ? `${summary.documentCount} documento(s) do ano encontrados.` : 'Nenhum holerite arquivado para o ano.', summary.documentCount > 0 ? 'Em andamento' : 'Pendente', summary.documentCount > 0 ? 'ready' : 'pending'),
        statusRow('Informe de Rendimentos', reportsForYear.length > 0 ? `${reportsForYear.length} informe(s) anual(is) arquivado(s).` : 'Documento anual oficial da fonte pagadora ainda não arquivado.', reportsForYear.length > 0 ? 'Arquivado' : 'Pendente', reportsForYear.length > 0 ? 'ready' : 'pending'),
        statusRow('Instituições financeiras', `${activeAccounts} conta(s) cadastrada(s) hoje. Ainda faltará conferir os informes anuais.`, 'A preparar', 'pending'),
        statusRow('Patrimônio e dívidas', `${activeAssets} ativo(s) e ${activeDebts} dívida(s) cadastrados atualmente.`, 'A conferir', 'pending')
    ]));

    return root;
}

export async function renderFiscalDossierV1(context) {
    const [payslips, reports, accounts, debts, assets] = await Promise.all([
        listPayslips(context.profile.id),
        listIncomeReports(context.profile.id),
        context.repositories.accounts.listByProfile(context.profile.id),
        context.repositories.debts.listByProfile(context.profile.id),
        context.repositories.assets.listByProfile(context.profile.id)
    ]);
    const years = availableFiscalYears(payslips, reports);
    let selectedYear = years[0];
    const root = el('div', 'fiscal-screen-v1 fiscal-dossier-v1');
    const content = el('div', 'fiscal-dossier-content-v1');
    const selector = el('select', 'fiscal-year-select-v1');
    for (const year of years) {
        const option = document.createElement('option');
        option.value = String(year);
        option.textContent = String(year);
        selector.append(option);
    }

    const renderYear = () => {
        const summary = buildAnnualTaxPreparation(payslips, selectedYear);
        const reportsForYear = reports.filter((item) => item.year === selectedYear);
        const counts = {
            accounts: accounts.filter((item) => !item.deactivatedAt).length,
            debts: debts.filter((item) => !item.deactivatedAt).length,
            assets: assets.filter((item) => !item.deactivatedAt).length
        };
        const exportButton = el('button', 'fiscal-primary-v1', ['Exportar dossiê de preparação']);
        exportButton.type = 'button';
        exportButton.addEventListener('click', () => {
            downloadTextFile(`orion-dossie-fiscal-${selectedYear}.txt`, dossierText(summary, counts, reportsForYear.length));
        });
        content.replaceChildren(
            el('section', 'fiscal-hero-v1 compact', [
                el('span', 'fiscal-kicker-v1', ['DOSSIÊ FISCAL']),
                el('strong', '', [`Ano-calendário ${selectedYear}`]),
                el('p', '', ['Uma pasta de preparação: o que o Orion já consegue sustentar com dados e quais documentos ainda precisam entrar.'])
            ]),
            el('div', 'fiscal-metrics-v1', [
                metric('Bruto', formatBRL(summary.totals.grossEarnings), 'Rendimentos dos holerites'),
                metric('INSS', formatBRL(summary.totals.inssDiscount), 'Descontado nos holerites'),
                metric('IRRF', formatBRL(summary.totals.irrfDiscount), 'Retido nos holerites'),
                metric('Líquido', formatBRL(summary.totals.netPay), 'Valor líquido documentado')
            ]),
            el('section', 'fiscal-section-v1', [
                el('h2', '', ['Checklist do dossiê']),
                statusRow('Rendimentos do trabalho', summary.documentCount > 0 ? `${summary.documentCount} holerite(s) organizados.` : 'Ainda sem holerites para este ano.', summary.documentCount > 0 ? 'Parcial' : 'Pendente', summary.documentCount > 0 ? 'ready' : 'pending'),
                statusRow('Informe de Rendimentos', reportsForYear.length > 0 ? `${reportsForYear.length} informe(s) anual(is) arquivado(s) para conciliação.` : 'Ainda falta o documento anual da fonte pagadora.', reportsForYear.length > 0 ? 'Arquivado' : 'Pendente', reportsForYear.length > 0 ? 'ready' : 'pending'),
                statusRow('Bancos e contas', `${counts.accounts} conta(s) cadastrada(s). Para IR, ainda será necessário o informe anual e a posição exigida.`, 'Parcial', 'pending'),
                statusRow('Bens e direitos', `${counts.assets} ativo(s) cadastrado(s) atualmente. O Orion ainda precisa montar a posição fiscal por ano.`, 'Parcial', 'pending'),
                statusRow('Dívidas', `${counts.debts} dívida(s) cadastrada(s) atualmente. O saldo fiscal precisa ser conferido na data correta.`, 'Parcial', 'pending'),
                statusRow('Despesas dedutíveis e outras rendas', 'Ainda não há documentação fiscal específica para essas categorias.', 'Pendente', 'pending')
            ]),
            el('section', 'fiscal-note-v1', [
                el('strong', '', ['Leitura do Orion']),
                el('p', '', ['Este dossiê organiza evidências. Ele não presume que um item é tributável, dedutível ou obrigatório sem a regra aplicável ao exercício.'])
            ]),
            exportButton
        );
    };

    selector.addEventListener('change', () => {
        selectedYear = Number(selector.value);
        renderYear();
    });
    root.append(el('label', 'fiscal-year-picker-v1', [el('span', '', ['Ano-calendário']), selector]), content);
    renderYear();
    return root;
}
