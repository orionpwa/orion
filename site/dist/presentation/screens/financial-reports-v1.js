import { parseMajorToCents, formatBRL } from '../../domain/money/money.js';
import { parseFinancialReportText } from '../../application/documents/parse-financial-report.js';
import { listFinancialReports, getFinancialReport, saveFinancialReport, deleteFinancialReport } from '../../data/documents/database.js';
import { extractPdfText } from '../../infrastructure/documents/pdf-text-reader.js';
import { el } from '../dom.js';
import { showToast } from '../components/feedback.js';

const INSTITUTIONS = [
    { value: 'bradesco', label: 'Bradesco' },
    { value: 'inter', label: 'Inter' },
    { value: 'custom', label: 'Outra instituição' }
];

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

function choiceField(label, options, value = '') {
    const select = el('select', 'documents-input-v1');
    for (const item of options) {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        select.append(option);
    }
    select.value = value || options[0]?.value || '';
    return { input: select, element: el('label', 'documents-field-v1', [el('span', '', [label]), select]) };
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
    anchor.download = fileName || 'informe-financeiro.pdf';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function institutionLabel(item) {
    if (item.institutionId === 'bradesco')
        return 'Bradesco';
    if (item.institutionId === 'inter')
        return 'Inter';
    return item.institutionName || 'Instituição financeira';
}

export async function renderFinancialReportsListV1(context, actions) {
    const items = await listFinancialReports(context.profile.id);
    const root = el('div', 'documents-screen-v1');
    root.append(el('section', 'documents-intro-v1', [
        el('strong', '', ['Informes das instituições financeiras']),
        el('p', '', ['Arquive os PDFs anuais dos bancos sem misturar a posição fiscal de 31/12 com o saldo atual das contas.'])
    ]));
    const create = el('button', 'documents-primary-v1', ['Ler informe financeiro PDF']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    root.append(create);
    if (items.length === 0) {
        root.append(el('div', 'documents-empty-v1', [
            el('strong', '', ['Nenhum informe financeiro arquivado']),
            el('span', '', ['Quando Bradesco ou Inter disponibilizarem o informe anual, importe o PDF aqui e confira os valores antes de salvar.'])
        ]));
        return root;
    }
    const list = el('div', 'documents-list-v1');
    for (const item of items) {
        const button = el('button', 'documents-row-v1', [
            el('span', 'documents-row-copy-v1', [
                el('strong', '', [institutionLabel(item)]),
                el('small', '', [`Ano-calendário ${item.year}`])
            ]),
            el('span', 'documents-row-value-v1', [
                el('strong', '', [item.yearEndBalance !== null ? formatBRL(item.yearEndBalance) : 'Revisar']),
                el('small', '', ['Saldo/posição em 31/12'])
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

export function renderNewFinancialReportV1(context, actions) {
    const root = el('div', 'documents-screen-v1 documents-import-v1');
    const fileInput = el('input', 'documents-file-input-v1');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,.pdf';
    const choose = el('label', 'documents-file-card-v1', [
        el('strong', '', ['Selecionar informe financeiro']),
        el('span', '', ['O PDF é lido localmente e não altera saldo, movimentos ou patrimônio.']),
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
        status.textContent = 'Lendo o informe localmente…';
        void extractPdfText(selectedFile).then((text) => {
            const parsed = parseFinancialReportText(text);
            status.textContent = parsed.confidence === 'high'
                ? 'Leitura concluída. Confira os valores com o PDF antes de salvar.'
                : 'Leitura parcial. Informe ou corrija os campos antes de salvar.';
            const year = field('Ano-calendário', 'number', parsed.year ?? new Date().getFullYear());
            year.input.min = '2000';
            year.input.max = '2200';
            const institution = choiceField('Instituição', INSTITUTIONS, parsed.institutionId || 'custom');
            const institutionName = field('Nome da instituição', 'text', parsed.institutionName);
            const cnpj = field('CNPJ da instituição', 'text', parsed.institutionCnpj);
            const yearEndBalance = moneyField('Saldo/posição em 31/12', parsed.yearEndBalance);
            const taxable = moneyField('Rendimentos tributáveis identificados', parsed.taxableIncome);
            const exempt = moneyField('Rendimentos isentos identificados', parsed.exemptIncome);
            const exclusive = moneyField('Tributação exclusiva identificada', parsed.exclusiveIncome);
            const irrf = moneyField('IRRF identificado', parsed.irrf);
            const error = el('div', 'documents-error-v1');
            const save = el('button', 'documents-primary-v1', ['Salvar informe financeiro']);
            save.type = 'button';
            const syncInstitutionName = () => {
                if (institution.input.value === 'bradesco')
                    institutionName.input.value = 'Bradesco';
                else if (institution.input.value === 'inter')
                    institutionName.input.value = 'Inter';
            };
            institution.input.addEventListener('change', syncInstitutionName);
            syncInstitutionName();
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
                        kind: 'financial-report',
                        year: parsedYear,
                        institutionId: institution.input.value,
                        institutionName: institutionName.input.value.trim(),
                        institutionCnpj: cnpj.input.value.trim(),
                        yearEndBalance: optionalCents(yearEndBalance.input),
                        taxableIncome: optionalCents(taxable.input),
                        exemptIncome: optionalCents(exempt.input),
                        exclusiveIncome: optionalCents(exclusive.input),
                        irrf: optionalCents(irrf.input),
                        fileName: selectedFile.name,
                        fileType: selectedFile.type,
                        fileSize: selectedFile.size,
                        pdfBlob: selectedFile,
                        importedAt: new Date().toISOString(),
                        parserVersion: 1
                    };
                    void saveFinancialReport(record).then(() => {
                        showToast('Informe financeiro salvo.', 'success');
                        actions.onSaved(record.id);
                    }).catch((failure) => {
                        save.disabled = false;
                        error.textContent = failure instanceof Error ? failure.message : 'Não foi possível salvar o informe.';
                    });
                }
                catch (failure) {
                    save.disabled = false;
                    error.textContent = failure instanceof Error ? failure.message : 'Revise os campos antes de salvar.';
                }
            });
            review.replaceChildren(el('div', 'documents-form-v1', [
                el('div', 'documents-review-note-v1', ['A posição de 31/12 é um dado fiscal histórico. Ela não substitui nem altera o saldo atual cadastrado no Orion.']),
                year.element, institution.element, institutionName.element, cnpj.element,
                yearEndBalance.element, taxable.element, exempt.element, exclusive.element, irrf.element,
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

export async function renderFinancialReportDetailV1(context, id, actions) {
    const report = await getFinancialReport(id);
    if (!report || report.profileId !== context.profile.id)
        throw new TypeError('Informe financeiro não encontrado.');
    const root = el('div', 'documents-screen-v1 documents-detail-v1');
    root.append(el('section', 'documents-hero-v1', [
        el('span', '', ['POSIÇÃO FISCAL EM 31/12']),
        el('strong', '', [report.yearEndBalance !== null ? formatBRL(report.yearEndBalance) : 'Não informada']),
        el('small', '', [`${institutionLabel(report)} · ano-calendário ${report.year}`])
    ]));
    root.append(el('div', 'documents-detail-grid-v1', [
        row('Instituição', institutionLabel(report)),
        row('CNPJ', report.institutionCnpj || 'Não informado'),
        row('Rendimentos tributáveis', report.taxableIncome !== null ? formatBRL(report.taxableIncome) : 'Não identificados'),
        row('Rendimentos isentos', report.exemptIncome !== null ? formatBRL(report.exemptIncome) : 'Não identificados'),
        row('Tributação exclusiva', report.exclusiveIncome !== null ? formatBRL(report.exclusiveIncome) : 'Não identificada'),
        row('IRRF', report.irrf !== null ? formatBRL(report.irrf) : 'Não identificado')
    ]));
    root.append(el('section', 'fiscal-note-v1', [
        el('strong', '', ['Separação importante']),
        el('p', '', ['Este documento guarda a posição fiscal histórica informada pelo banco. O saldo atual das contas continua vindo dos registros financeiros do Orion.'])
    ]));
    const actionsBox = el('div', 'documents-detail-actions-v1');
    if (report.pdfBlob instanceof Blob) {
        const download = el('button', 'documents-secondary-v1', ['Abrir PDF original']);
        download.type = 'button';
        download.addEventListener('click', () => downloadBlob(report.pdfBlob, report.fileName));
        actionsBox.append(download);
    }
    const remove = el('button', 'documents-danger-v1', ['Excluir informe']);
    remove.type = 'button';
    remove.addEventListener('click', () => {
        if (!window.confirm(`Excluir o informe financeiro de ${report.year} de ${institutionLabel(report)}?`))
            return;
        remove.disabled = true;
        void deleteFinancialReport(context.profile.id, report.id).then(() => {
            showToast('Informe financeiro excluído.', 'success');
            actions.onDeleted();
        }).catch((failure) => {
            remove.disabled = false;
            showToast(failure instanceof Error ? failure.message : 'Não foi possível excluir o informe.', 'error');
        });
    });
    actionsBox.append(remove);
    root.append(actionsBox);
    return root;
}
