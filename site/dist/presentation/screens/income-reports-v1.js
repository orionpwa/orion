import { parseMajorToCents, formatBRL } from '../../domain/money/money.js';
import { parseIncomeReportText } from '../../application/documents/parse-income-report.js';
import { buildAnnualTaxPreparation } from '../../application/documents/annual-tax-summary.js';
import { reconcileIncomeReport } from '../../application/documents/reconcile-income-report.js';
import { listPayslips, listIncomeReports, getIncomeReport, saveIncomeReport, deleteIncomeReport } from '../../data/documents/database.js';
import { extractPdfText } from '../../infrastructure/documents/pdf-text-reader.js';
import { el } from '../dom.js';
import { showToast } from '../components/feedback.js';

function centsToInput(value) {
    if (value === null || value === undefined)
        return '';
    return (value / 100).toFixed(2).replace('.', ',');
}

function field(label, type = 'text', value = '') {
    const input = el('input', 'documents-input-v1');
    input.type = type;
    input.value = value ?? '';
    if (type === 'text')
        input.autocomplete = 'off';
    return { input, element: el('label', 'documents-field-v1', [el('span', '', [label]), input]) };
}

function moneyField(label, value) {
    const result = field(label, 'text', centsToInput(value));
    result.input.inputMode = 'decimal';
    result.input.placeholder = '0,00';
    return result;
}

function optionalCents(input) {
    const value = input.value.trim();
    return value ? parseMajorToCents(value) : null;
}

function row(label, value) {
    return el('div', 'documents-detail-row-v1', [el('span', '', [label]), el('strong', '', [value])]);
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || 'informe-de-rendimentos.pdf';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function reportLabel(item) {
    return item.employer || item.employerCnpj || 'Fonte pagadora';
}

function comparisonRow(item) {
    const difference = item.difference;
    const diffLabel = difference === 0 ? 'Sem diferença' : `${difference > 0 ? '+' : ''}${formatBRL(difference)}`;
    const tone = item.status === 'aligned' ? 'aligned' : item.status === 'close' ? 'close' : 'review';
    return el('div', `income-report-compare-v1 ${tone}`, [
        el('div', 'income-report-compare-heading-v1', [
            el('strong', '', [item.label]),
            el('span', '', [diffLabel])
        ]),
        el('div', 'income-report-compare-values-v1', [
            el('span', '', [`Holerites: ${formatBRL(item.payslipValue)}`]),
            el('span', '', [`Informe: ${formatBRL(item.reportValue)}`])
        ]),
        el('small', '', [item.note])
    ]);
}

export async function renderIncomeReportsListV1(context, actions) {
    const items = await listIncomeReports(context.profile.id);
    const root = el('div', 'documents-screen-v1 income-reports-screen-v1');
    root.append(el('section', 'documents-intro-v1', [
        el('strong', '', ['Informes de Rendimentos']),
        el('p', '', ['Arquive o documento anual da fonte pagadora e compare os totais oficiais com a soma dos holerites do mesmo ano.'])
    ]));
    const create = el('button', 'documents-primary-v1', ['Ler Informe de Rendimentos PDF']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    root.append(create);
    if (items.length === 0) {
        root.append(el('div', 'documents-empty-v1', [
            el('strong', '', ['Nenhum informe anual arquivado']),
            el('span', '', ['Quando receber o Informe de Rendimentos da fonte pagadora, importe o PDF aqui para iniciar a conciliação anual.'])
        ]));
        return root;
    }
    const list = el('div', 'documents-list-v1');
    for (const item of items) {
        const button = el('button', 'documents-row-v1', [
            el('span', 'documents-row-copy-v1', [
                el('strong', '', [String(item.year)]),
                el('small', '', [reportLabel(item)])
            ]),
            el('span', 'documents-row-value-v1', [
                el('strong', '', [item.taxableIncome !== null ? formatBRL(item.taxableIncome) : 'Revisar']),
                el('small', '', ['Rendimentos tributáveis'])
            ]),
            el('span', 'documents-chevron-v1', ['›'])
        ]);
        button.type = 'button';
        button.addEventListener('click', () => actions.onOpen(item.id));
        list.append(button);
    }
    root.append(list);
    return root;
}

export function renderNewIncomeReportV1(context, actions) {
    const root = el('div', 'documents-screen-v1 documents-import-v1');
    const fileInput = el('input', 'documents-file-input-v1');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,.pdf';
    const choose = el('label', 'documents-file-card-v1', [
        el('strong', '', ['Selecionar Informe de Rendimentos']),
        el('span', '', ['O PDF é lido no navegador e não cria movimentações financeiras.']),
        fileInput
    ]);
    const read = el('button', 'documents-primary-v1', ['Ler PDF']);
    read.type = 'button';
    read.disabled = true;
    const status = el('div', 'documents-status-v1');
    const review = el('div', 'documents-review-v1');
    review.hidden = true;
    root.append(choose, read, status, review);
    let selectedFile = null;
    fileInput.addEventListener('change', () => {
        selectedFile = fileInput.files?.[0] ?? null;
        read.disabled = !selectedFile;
        status.textContent = selectedFile ? selectedFile.name : '';
        review.hidden = true;
        review.replaceChildren();
    });
    read.addEventListener('click', () => {
        if (!selectedFile)
            return;
        read.disabled = true;
        status.textContent = 'Lendo o Informe localmente…';
        void extractPdfText(selectedFile).then((text) => {
            const parsed = parseIncomeReportText(text);
            status.textContent = parsed.confidence === 'high'
                ? 'Leitura concluída. Confira os valores oficiais antes de salvar.'
                : 'Leitura parcial. Revise os campos antes de salvar.';
            const year = field('Ano-calendário', 'number', parsed.year ?? new Date().getFullYear());
            year.input.min = '2000';
            year.input.max = '2200';
            const employer = field('Fonte pagadora', 'text', parsed.employer);
            const cnpj = field('CNPJ da fonte pagadora', 'text', parsed.employerCnpj);
            const taxable = moneyField('Rendimentos tributáveis', parsed.taxableIncome);
            const officialPension = moneyField('Previdência oficial', parsed.officialPension);
            const privatePension = moneyField('Previdência complementar', parsed.privatePension);
            const alimony = moneyField('Pensão alimentícia', parsed.alimony);
            const irrf = moneyField('IRRF', parsed.irrf);
            const thirteenth = moneyField('13º salário', parsed.thirteenthSalary);
            const thirteenthIrrf = moneyField('IRRF sobre 13º', parsed.thirteenthIrrf);
            const error = el('div', 'documents-error-v1');
            const save = el('button', 'documents-primary-v1', ['Salvar Informe']);
            save.type = 'button';
            save.addEventListener('click', () => {
                error.textContent = '';
                save.disabled = true;
                try {
                    const parsedYear = Number(year.input.value);
                    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2200)
                        throw new RangeError('Informe um ano-calendário válido.');
                    const record = {
                        id: crypto.randomUUID(),
                        profileId: context.profile.id,
                        kind: 'income-report',
                        year: parsedYear,
                        employer: employer.input.value.trim(),
                        employerCnpj: cnpj.input.value.trim(),
                        taxableIncome: optionalCents(taxable.input),
                        officialPension: optionalCents(officialPension.input),
                        privatePension: optionalCents(privatePension.input),
                        alimony: optionalCents(alimony.input),
                        irrf: optionalCents(irrf.input),
                        thirteenthSalary: optionalCents(thirteenth.input),
                        thirteenthIrrf: optionalCents(thirteenthIrrf.input),
                        fileName: selectedFile.name,
                        fileType: selectedFile.type,
                        fileSize: selectedFile.size,
                        pdfBlob: selectedFile,
                        importedAt: new Date().toISOString(),
                        parserVersion: 1
                    };
                    void saveIncomeReport(record).then(() => {
                        showToast('Informe de Rendimentos salvo.', 'success');
                        actions.onSaved(record.id);
                    }).catch((failure) => {
                        save.disabled = false;
                        error.textContent = failure instanceof Error ? failure.message : 'Não foi possível salvar o Informe.';
                    });
                }
                catch (failure) {
                    save.disabled = false;
                    error.textContent = failure instanceof Error ? failure.message : 'Revise os campos antes de salvar.';
                }
            });
            review.replaceChildren(el('div', 'documents-form-v1', [
                el('div', 'documents-review-note-v1', ['Confira os valores com o PDF. O Orion usará este documento como referência oficial para a conciliação do ano.']),
                year.element, employer.element, cnpj.element, taxable.element, officialPension.element,
                privatePension.element, alimony.element, irrf.element, thirteenth.element, thirteenthIrrf.element,
                error, save
            ]));
            review.hidden = false;
        }).catch((failure) => {
            read.disabled = false;
            status.textContent = failure instanceof Error ? failure.message : 'Não foi possível ler o PDF.';
        });
    });
    return root;
}

export async function renderIncomeReportDetailV1(context, id, actions) {
    const report = await getIncomeReport(id);
    if (!report || report.profileId !== context.profile.id)
        throw new TypeError('Informe de Rendimentos não encontrado.');
    const payslips = await listPayslips(context.profile.id);
    const annual = buildAnnualTaxPreparation(payslips, report.year);
    const reconciliation = reconcileIncomeReport(annual, report);
    const root = el('div', 'documents-screen-v1 documents-detail-v1 income-report-detail-v1');
    root.append(el('section', 'documents-hero-v1', [
        el('span', '', ['RENDIMENTOS TRIBUTÁVEIS']),
        el('strong', '', [report.taxableIncome !== null ? formatBRL(report.taxableIncome) : 'Não informado']),
        el('small', '', [`Ano-calendário ${report.year}`])
    ]));
    root.append(el('div', 'documents-detail-grid-v1', [
        row('Fonte pagadora', report.employer || 'Não informada'),
        row('CNPJ', report.employerCnpj || 'Não informado'),
        row('Previdência oficial', report.officialPension !== null ? formatBRL(report.officialPension) : 'Não informada'),
        row('Previdência complementar', report.privatePension !== null ? formatBRL(report.privatePension) : 'Não informada'),
        row('Pensão alimentícia', report.alimony !== null ? formatBRL(report.alimony) : 'Não informada'),
        row('IRRF', report.irrf !== null ? formatBRL(report.irrf) : 'Não informado'),
        row('13º salário', report.thirteenthSalary !== null ? formatBRL(report.thirteenthSalary) : 'Não informado'),
        row('IRRF sobre 13º', report.thirteenthIrrf !== null ? formatBRL(report.thirteenthIrrf) : 'Não informado')
    ]));
    root.append(el('section', 'income-report-reconciliation-v1', [
        el('h2', '', ['Conciliação com os holerites']),
        el('p', '', [`${annual.documentCount} holerite(s) de ${report.year} foram usados na comparação. Diferenças são sinalizadas para revisão, não tratadas automaticamente como erro.`]),
        ...reconciliation.rows.map(comparisonRow)
    ]));
    const actionsBox = el('div', 'documents-detail-actions-v1');
    if (report.pdfBlob instanceof Blob) {
        const download = el('button', 'documents-secondary-v1', ['Abrir PDF original']);
        download.type = 'button';
        download.addEventListener('click', () => downloadBlob(report.pdfBlob, report.fileName));
        actionsBox.append(download);
    }
    const remove = el('button', 'documents-danger-v1', ['Excluir Informe']);
    remove.type = 'button';
    remove.addEventListener('click', () => {
        if (!window.confirm(`Excluir o Informe de Rendimentos de ${report.year}?`))
            return;
        remove.disabled = true;
        void deleteIncomeReport(context.profile.id, report.id).then(() => {
            showToast('Informe excluído.', 'success');
            actions.onDeleted();
        }).catch((failure) => {
            remove.disabled = false;
            showToast(failure instanceof Error ? failure.message : 'Não foi possível excluir o Informe.', 'error');
        });
    });
    actionsBox.append(remove);
    root.append(actionsBox);
    return root;
}
