import { formatBRL } from '../../domain/money/money.js';
import { listPayslips } from '../../data/documents/database.js';
import { availableTaxYears, buildAnnualTaxPreparation, annualTaxPreparationCsv } from '../../application/documents/annual-tax-summary.js';
import { el } from '../dom.js';
import { downloadTextFile } from '../download.js';

function monthLabel(value) {
    if (!/^\d{4}-\d{2}$/.test(value ?? ''))
        return value || 'Competência não informada';
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, month - 1, 1)).replace('.', '');
}

function metric(label, value, support = '') {
    return el('div', 'documents-ir-metric-v1', [
        el('span', '', [label]),
        el('strong', '', [formatBRL(value)]),
        support ? el('small', '', [support]) : null
    ].filter(Boolean));
}

function employerCard(item) {
    return el('section', 'documents-ir-employer-v1', [
        el('div', 'documents-ir-employer-heading-v1', [
            el('strong', '', [item.name]),
            el('small', '', [item.cnpj || 'CNPJ não informado'])
        ]),
        el('div', 'documents-ir-employer-values-v1', [
            el('span', '', [`Bruto ${formatBRL(item.grossEarnings)}`]),
            el('span', '', [`INSS ${formatBRL(item.inssDiscount)}`]),
            el('span', '', [`IRRF ${formatBRL(item.irrfDiscount)}`]),
            el('span', '', [`Líquido ${formatBRL(item.netPay)}`])
        ])
    ]);
}

function monthRow(item) {
    return el('div', 'documents-ir-month-row-v1', [
        el('strong', '', [monthLabel(item.competence)]),
        el('span', '', [formatBRL(item.grossEarnings ?? 0)]),
        el('span', '', [formatBRL(item.inssDiscount ?? 0)]),
        el('span', '', [formatBRL(item.irrfDiscount ?? 0)]),
        el('span', '', [formatBRL(item.netPay ?? 0)])
    ]);
}

function coverageText(summary) {
    if (summary.documentCount === 0)
        return 'Nenhum holerite arquivado para este ano.';
    const fields = ['grossEarnings', 'inssDiscount', 'irrfDiscount', 'netPay'];
    const complete = fields.every((field) => summary.completeness[field] === summary.documentCount);
    return complete
        ? `${summary.documentCount} holerite(s) considerados. Os campos principais estão preenchidos em todos eles.`
        : `${summary.documentCount} holerite(s) considerados. Há campos ausentes em parte do histórico; confira antes de usar os totais.`;
}

export async function renderDocumentsIrV1(context) {
    const payslips = await listPayslips(context.profile.id);
    const years = availableTaxYears(payslips);
    const root = el('div', 'documents-screen-v1 documents-ir-v1');
    const intro = el('section', 'documents-intro-v1', [
        el('strong', '', ['Preparação para Imposto de Renda']),
        el('p', '', ['Este painel organiza os holerites por ano-calendário para estudo e conferência. Ele não substitui informe de rendimentos, declaração oficial nem determina obrigatoriedade de declarar.'])
    ]);
    const yearSelect = el('select', 'documents-input-v1');
    for (const year of years) {
        const option = document.createElement('option');
        option.value = String(year);
        option.textContent = `Ano-calendário ${year}`;
        yearSelect.append(option);
    }
    const selector = el('label', 'documents-field-v1', [el('span', '', ['Ano-calendário']), yearSelect]);
    const content = el('div', 'documents-ir-content-v1');
    root.append(intro, selector, content);

    const renderYear = () => {
        const year = Number(yearSelect.value);
        const summary = buildAnnualTaxPreparation(payslips, year);
        const children = [];
        children.push(el('div', 'documents-ir-coverage-v1', [coverageText(summary)]));
        if (summary.documentCount === 0) {
            children.push(el('div', 'documents-empty-v1', [
                el('strong', '', ['Sem dados para consolidar']),
                el('span', '', ['Arquive os holerites deste ano em Documentos. O resumo será montado automaticamente.'])
            ]));
            content.replaceChildren(...children);
            return;
        }
        children.push(el('div', 'documents-ir-grid-v1', [
            metric('Rendimentos brutos', summary.totals.grossEarnings, 'Soma dos proventos identificados'),
            metric('INSS descontado', summary.totals.inssDiscount),
            metric('IRRF retido', summary.totals.irrfDiscount),
            metric('Líquido recebido', summary.totals.netPay),
            metric('Descontos totais', summary.totals.totalDeductions),
            metric('FGTS informado', summary.totals.fgtsValue, 'Acompanhamento patrimonial; não tratado aqui como rendimento tributável')
        ]));
        const employers = el('section', 'documents-ir-section-v1', [el('h2', '', ['Por empregador'])]);
        for (const employer of summary.employers)
            employers.append(employerCard(employer));
        children.push(employers);
        const months = el('section', 'documents-ir-section-v1', [
            el('h2', '', ['Mês a mês']),
            el('div', 'documents-ir-month-head-v1', [
                el('span', '', ['Mês']), el('span', '', ['Bruto']), el('span', '', ['INSS']), el('span', '', ['IRRF']), el('span', '', ['Líquido'])
            ])
        ]);
        for (const item of summary.documents)
            months.append(monthRow(item));
        children.push(months);
        const exportCsv = el('button', 'documents-secondary-v1', ['Exportar resumo em CSV']);
        exportCsv.type = 'button';
        exportCsv.addEventListener('click', () => {
            downloadTextFile(`orion-preparacao-ir-${summary.year}.csv`, annualTaxPreparationCsv(summary), 'text/csv;charset=utf-8');
        });
        children.push(exportCsv);
        children.push(el('section', 'documents-ir-checklist-v1', [
            el('strong', '', ['O que ainda precisa ser conferido para uma declaração real']),
            el('p', '', ['Informes anuais de rendimentos, bancos e aplicações, bens e direitos, dívidas, outras fontes de renda, despesas dedutíveis e demais situações aplicáveis ao ano. As regras oficiais devem ser verificadas no momento da declaração.'])
        ]));
        content.replaceChildren(...children);
    };
    yearSelect.addEventListener('change', renderYear);
    renderYear();
    return root;
}
