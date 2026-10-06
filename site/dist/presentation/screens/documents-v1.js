import { parseMajorToCents, formatBRL } from '../../domain/money/money.js';
import { parsePayslipText } from '../../application/documents/parse-payslip.js';
import { listPayslips, getPayslip, savePayslip, deletePayslip } from '../../data/documents/database.js';
import { createDocumentsBackup, parseDocumentsBackup, restoreDocumentsBackup } from '../../data/documents/backup.js';
import { extractPdfText } from '../../infrastructure/documents/pdf-text-reader.js';
import { el } from '../dom.js';
import { downloadTextFile } from '../download.js';
import { showToast } from '../components/feedback.js';

function competenceLabel(value) {
    if (!/^\d{4}-\d{2}$/.test(value ?? ''))
        return value || 'Competência não informada';
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const text = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function centsToInput(value) {
    if (value === null || value === undefined)
        return '';
    return (value / 100).toFixed(2).replace('.', ',');
}

function inputField(label, type = 'text', value = '') {
    const input = el('input', 'documents-input-v1');
    input.type = type;
    input.value = value;
    if (type === 'text')
        input.autocomplete = 'off';
    return { input, element: el('label', 'documents-field-v1', [el('span', '', [label]), input]) };
}

function moneyField(label, value) {
    const field = inputField(label, 'text', centsToInput(value));
    field.input.inputMode = 'decimal';
    field.input.placeholder = '0,00';
    return field;
}

function optionalCents(input) {
    const value = input.value.trim();
    return value ? parseMajorToCents(value) : null;
}

function detailRow(label, value) {
    return el('div', 'documents-detail-row-v1', [el('span', '', [label]), el('strong', '', [value])]);
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || 'holerite.pdf';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function backupFileName(now = new Date()) {
    return `orion-documentos-${now.toISOString().slice(0, 10)}.json`;
}

export async function renderDocumentsListV1(context, actions) {
    const items = await listPayslips(context.profile.id);
    const root = el('div', 'documents-screen-v1');
    root.append(el('section', 'documents-intro-v1', [
        el('strong', '', ['Arquivo pessoal de holerites']),
        el('p', '', ['Os PDFs são lidos no navegador. Salvar um holerite não cria receita, não altera saldo e não interfere no Financial Core.'])
    ]));
    const create = el('button', 'documents-primary-v1', ['Ler holerite PDF']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    root.append(create);

    const backupInput = el('input', 'documents-backup-input-v1');
    backupInput.type = 'file';
    backupInput.accept = 'application/json,.json';
    backupInput.hidden = true;
    const exportBackup = el('button', 'documents-secondary-v1', ['Exportar backup de Documentos']);
    exportBackup.type = 'button';
    exportBackup.disabled = items.length === 0;
    const restoreBackup = el('button', 'documents-secondary-v1', ['Restaurar backup']);
    restoreBackup.type = 'button';
    const backupStatus = el('span', 'documents-backup-status-v1', [
        'Este backup é separado do backup financeiro v2 e inclui os PDFs originais.'
    ]);
    const backupActions = el('div', 'documents-backup-actions-v1', [exportBackup, restoreBackup]);
    root.append(el('section', 'documents-backup-v1', [
        el('strong', '', ['Backup do arquivo documental']),
        backupStatus,
        backupActions,
        backupInput
    ]));

    exportBackup.addEventListener('click', () => {
        exportBackup.disabled = true;
        backupStatus.textContent = 'Preparando backup local…';
        void createDocumentsBackup(context.profile.id).then((backup) => {
            downloadTextFile(backupFileName(), JSON.stringify(backup, null, 2));
            backupStatus.textContent = `${backup.documentCount} documento(s) incluído(s). Guarde este arquivo em local seguro.`;
            showToast('Backup de Documentos gerado.', 'success');
        }).catch((failure) => {
            backupStatus.textContent = failure instanceof Error ? failure.message : 'Não foi possível gerar o backup.';
            showToast('Falha ao gerar backup de Documentos.', 'error');
        }).finally(() => {
            exportBackup.disabled = items.length === 0;
        });
    });

    restoreBackup.addEventListener('click', () => backupInput.click());
    backupInput.addEventListener('change', () => {
        const file = backupInput.files?.[0] ?? null;
        if (!file)
            return;
        if (file.size > 50 * 1024 * 1024) {
            backupStatus.textContent = 'O backup selecionado é grande demais para restaurar nesta versão.';
            backupInput.value = '';
            return;
        }
        restoreBackup.disabled = true;
        backupStatus.textContent = 'Conferindo e restaurando o backup…';
        void file.text().then((text) => parseDocumentsBackup(text)).then((backup) => restoreDocumentsBackup(context.profile.id, backup)).then((result) => {
            backupStatus.textContent = result.skipped > 0
                ? `${result.imported} documento(s) restaurado(s); ${result.skipped} já existente(s) foram preservado(s).`
                : `${result.imported} documento(s) restaurado(s).`;
            showToast(result.imported > 0 ? 'Backup de Documentos restaurado.' : 'Nenhum documento novo para restaurar.', 'success');
            actions.onChanged();
        }).catch((failure) => {
            backupStatus.textContent = failure instanceof Error ? failure.message : 'Não foi possível restaurar este backup.';
            showToast('Backup de Documentos não restaurado.', 'error');
        }).finally(() => {
            restoreBackup.disabled = false;
            backupInput.value = '';
        });
    });

    if (items.length === 0) {
        root.append(el('div', 'documents-empty-v1', [
            el('strong', '', ['Nenhum holerite arquivado']),
            el('span', '', ['Quando receber o próximo PDF, o Orion poderá extrair os principais valores e guardar o documento localmente.'])
        ]));
        return root;
    }
    const list = el('div', 'documents-list-v1');
    for (const item of items) {
        const row = el('button', 'documents-row-v1', [
            el('span', 'documents-row-copy-v1', [
                el('strong', '', [competenceLabel(item.competence)]),
                el('small', '', [item.employer || 'Holerite'])
            ]),
            el('span', 'documents-row-value-v1', [
                el('strong', '', [item.netPay !== null ? formatBRL(item.netPay) : 'Revisar']),
                el('small', '', ['Líquido'])
            ]),
            el('span', 'documents-chevron-v1', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpen(item.id));
        list.append(row);
    }
    root.append(list);
    return root;
}

export function renderNewPayslipV1(context, actions) {
    const root = el('div', 'documents-screen-v1 documents-import-v1');
    const fileInput = el('input', 'documents-file-input-v1');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,.pdf';
    const choose = el('label', 'documents-file-card-v1', [
        el('strong', '', ['Selecionar PDF do holerite']),
        el('span', '', ['O arquivo não é enviado ao Orion Finance nem vira movimentação.']),
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
        status.textContent = 'Lendo o PDF localmente…';
        review.hidden = true;
        void extractPdfText(selectedFile).then((text) => {
            const parsed = parsePayslipText(text);
            status.textContent = parsed.confidence === 'high'
                ? 'Leitura concluída. Confira os valores antes de salvar.'
                : 'Leitura concluída com campos incompletos. Revise antes de salvar.';
            const competence = inputField('Competência', 'month', parsed.competence);
            const employer = inputField('Empresa', 'text', parsed.employer);
            const cnpj = inputField('CNPJ da empresa', 'text', parsed.employerCnpj);
            const salaryBase = moneyField('Salário base', parsed.salaryBase);
            const gross = moneyField('Total de proventos', parsed.grossEarnings);
            const deductions = moneyField('Total de descontos', parsed.totalDeductions);
            const net = moneyField('Salário líquido', parsed.netPay);
            const inss = moneyField('INSS descontado', parsed.inssDiscount);
            const irrf = moneyField('IRRF descontado', parsed.irrfDiscount);
            const fgts = moneyField('FGTS do mês', parsed.fgtsValue);
            const baseInss = moneyField('Base INSS', parsed.baseInss);
            const baseFgts = moneyField('Base FGTS', parsed.baseFgts);
            const baseIrrf = moneyField('Base IRRF', parsed.baseIrrf);
            const premium = moneyField('Prêmio identificado', parsed.premium);
            const benefit = moneyField('Desconto VA/VR identificado', parsed.benefitDiscount);
            const error = el('div', 'documents-error-v1');
            const save = el('button', 'documents-primary-v1', ['Salvar holerite']);
            save.type = 'button';
            const form = el('div', 'documents-form-v1', [
                el('div', 'documents-review-note-v1', ['Confira os dados extraídos. O PDF original será guardado localmente junto deste registro.']),
                competence.element, employer.element, cnpj.element,
                salaryBase.element, gross.element, deductions.element, net.element,
                inss.element, irrf.element, fgts.element,
                baseInss.element, baseFgts.element, baseIrrf.element,
                premium.element, benefit.element, error, save
            ]);
            save.addEventListener('click', () => {
                error.textContent = '';
                save.disabled = true;
                try {
                    if (!competence.input.value)
                        throw new RangeError('Informe a competência do holerite.');
                    if (!net.input.value.trim())
                        throw new RangeError('Informe o salário líquido.');
                    const record = {
                        id: crypto.randomUUID(),
                        profileId: context.profile.id,
                        kind: 'payslip',
                        competence: competence.input.value,
                        employer: employer.input.value.trim(),
                        employerCnpj: cnpj.input.value.trim(),
                        salaryBase: optionalCents(salaryBase.input),
                        grossEarnings: optionalCents(gross.input),
                        totalDeductions: optionalCents(deductions.input),
                        netPay: optionalCents(net.input),
                        inssDiscount: optionalCents(inss.input),
                        irrfDiscount: optionalCents(irrf.input),
                        fgtsValue: optionalCents(fgts.input),
                        baseInss: optionalCents(baseInss.input),
                        baseFgts: optionalCents(baseFgts.input),
                        baseIrrf: optionalCents(baseIrrf.input),
                        premium: optionalCents(premium.input),
                        benefitDiscount: optionalCents(benefit.input),
                        fileName: selectedFile.name,
                        fileType: selectedFile.type,
                        fileSize: selectedFile.size,
                        pdfBlob: selectedFile,
                        importedAt: new Date().toISOString(),
                        parserVersion: 1
                    };
                    void savePayslip(record).then(() => {
                        showToast('Holerite salvo localmente.', 'success');
                        actions.onSaved(record.id);
                    }).catch((failure) => {
                        save.disabled = false;
                        error.textContent = failure instanceof Error ? failure.message : 'Não foi possível salvar o holerite.';
                    });
                }
                catch (failure) {
                    save.disabled = false;
                    error.textContent = failure instanceof Error ? failure.message : 'Revise os campos antes de salvar.';
                }
            });
            review.replaceChildren(form);
            review.hidden = false;
        }).catch((failure) => {
            read.disabled = false;
            status.textContent = failure instanceof Error ? failure.message : 'Não foi possível ler o PDF.';
        });
    });
    return root;
}

export async function renderPayslipDetailV1(context, id, actions) {
    const item = await getPayslip(id);
    if (!item || item.profileId !== context.profile.id)
        throw new TypeError('Holerite não encontrado.');
    const root = el('div', 'documents-screen-v1 documents-detail-v1');
    root.append(el('section', 'documents-hero-v1', [
        el('span', '', ['SALÁRIO LÍQUIDO']),
        el('strong', '', [item.netPay !== null ? formatBRL(item.netPay) : 'Não informado']),
        el('small', '', [competenceLabel(item.competence)])
    ]));
    const rows = [
        ['Empresa', item.employer || 'Não informada'],
        ['CNPJ', item.employerCnpj || 'Não informado'],
        ['Salário base', item.salaryBase !== null ? formatBRL(item.salaryBase) : 'Não informado'],
        ['Proventos', item.grossEarnings !== null ? formatBRL(item.grossEarnings) : 'Não informado'],
        ['Descontos', item.totalDeductions !== null ? formatBRL(item.totalDeductions) : 'Não informado'],
        ['INSS descontado', item.inssDiscount !== null ? formatBRL(item.inssDiscount) : 'Não identificado'],
        ['IRRF descontado', item.irrfDiscount !== null ? formatBRL(item.irrfDiscount) : 'Não identificado'],
        ['FGTS do mês', item.fgtsValue !== null ? formatBRL(item.fgtsValue) : 'Não identificado'],
        ['Base INSS', item.baseInss !== null ? formatBRL(item.baseInss) : 'Não informada'],
        ['Base FGTS', item.baseFgts !== null ? formatBRL(item.baseFgts) : 'Não informada'],
        ['Base IRRF', item.baseIrrf !== null ? formatBRL(item.baseIrrf) : 'Não informada'],
        ['Prêmio identificado', item.premium !== null ? formatBRL(item.premium) : 'Não identificado'],
        ['Desconto VA/VR', item.benefitDiscount !== null ? formatBRL(item.benefitDiscount) : 'Não identificado']
    ];
    root.append(el('div', 'documents-detail-list-v1', rows.map(([label, value]) => detailRow(label, value))));
    root.append(el('div', 'documents-file-meta-v1', [
        el('strong', '', ['PDF original']),
        el('span', '', [item.fileName || 'holerite.pdf'])
    ]));
    const download = el('button', 'documents-secondary-v1', ['Baixar PDF original']);
    download.type = 'button';
    download.addEventListener('click', () => {
        if (item.pdfBlob instanceof Blob)
            downloadBlob(item.pdfBlob, item.fileName);
    });
    const remove = el('button', 'documents-danger-v1', ['Excluir holerite']);
    remove.type = 'button';
    remove.addEventListener('click', () => {
        if (!window.confirm('Excluir este holerite do arquivo local? O saldo e os movimentos não serão alterados.'))
            return;
        remove.disabled = true;
        void deletePayslip(context.profile.id, item.id).then(() => {
            showToast('Holerite excluído.', 'success');
            actions.onDeleted();
        }).catch((failure) => {
            remove.disabled = false;
            showToast(failure instanceof Error ? failure.message : 'Não foi possível excluir.', 'error');
        });
    });
    root.append(el('div', 'documents-actions-v1', [download, remove]));
    return root;
}
