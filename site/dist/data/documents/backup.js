import { listPayslips, savePayslip } from './database.js';

export const DOCUMENTS_BACKUP_KIND = 'orion-documents-backup';
export const DOCUMENTS_BACKUP_FORMAT_VERSION = 1;

const MONEY_FIELDS = [
    'salaryBase', 'grossEarnings', 'totalDeductions', 'netPay',
    'inssDiscount', 'irrfDiscount', 'fgtsValue',
    'baseInss', 'baseFgts', 'baseIrrf', 'premium', 'benefitDiscount'
];

function bytesToBase64(bytes) {
    const chunkSize = 0x8000;
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

function base64ToBlob(value, mimeType) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1)
        bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mimeType || 'application/pdf' });
}

function stringValue(value, fallback = '') {
    return typeof value === 'string' ? value : fallback;
}

function centsValue(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

async function serializePayslip(item) {
    const pdfBlob = item.pdfBlob instanceof Blob ? item.pdfBlob : null;
    const pdfBase64 = pdfBlob ? bytesToBase64(new Uint8Array(await pdfBlob.arrayBuffer())) : null;
    const record = {
        kind: 'payslip',
        competence: stringValue(item.competence),
        employer: stringValue(item.employer),
        employerCnpj: stringValue(item.employerCnpj),
        fileName: stringValue(item.fileName, 'holerite.pdf'),
        fileType: stringValue(item.fileType, 'application/pdf'),
        fileSize: Number.isSafeInteger(item.fileSize) && item.fileSize >= 0 ? item.fileSize : (pdfBlob?.size ?? 0),
        importedAt: stringValue(item.importedAt),
        parserVersion: Number.isSafeInteger(item.parserVersion) ? item.parserVersion : 1,
        pdfBase64
    };
    for (const field of MONEY_FIELDS)
        record[field] = centsValue(item[field]);
    return record;
}

export async function createDocumentsBackup(profileId, now = new Date()) {
    const payslips = await listPayslips(profileId);
    const documents = [];
    for (const item of payslips)
        documents.push(await serializePayslip(item));
    return {
        kind: DOCUMENTS_BACKUP_KIND,
        formatVersion: DOCUMENTS_BACKUP_FORMAT_VERSION,
        exportedAt: now.toISOString(),
        documentCount: documents.length,
        documents
    };
}

export function parseDocumentsBackup(text) {
    let value;
    try {
        value = JSON.parse(text);
    }
    catch {
        throw new TypeError('O arquivo não é um backup JSON válido de Documentos.');
    }
    if (!value || value.kind !== DOCUMENTS_BACKUP_KIND)
        throw new TypeError('Este arquivo não é um backup de Documentos do Orion.');
    if (value.formatVersion !== DOCUMENTS_BACKUP_FORMAT_VERSION)
        throw new RangeError('A versão deste backup de Documentos não é compatível.');
    if (!Array.isArray(value.documents))
        throw new TypeError('O backup de Documentos está incompleto.');
    if (value.documents.length > 240)
        throw new RangeError('O backup contém documentos demais para esta versão do Orion.');
    return value;
}

function restoredRecord(source, profileId, now) {
    if (source?.kind !== 'payslip')
        throw new TypeError('O backup contém um tipo de documento ainda não suportado.');
    if (!/^\d{4}-\d{2}$/.test(source.competence ?? ''))
        throw new TypeError('O backup contém um holerite sem competência válida.');
    if (source.pdfBase64 !== null && typeof source.pdfBase64 !== 'string')
        throw new TypeError('O PDF de um holerite está inválido no backup.');
    const record = {
        id: crypto.randomUUID(),
        profileId,
        kind: 'payslip',
        competence: source.competence,
        employer: stringValue(source.employer),
        employerCnpj: stringValue(source.employerCnpj),
        fileName: stringValue(source.fileName, 'holerite.pdf'),
        fileType: stringValue(source.fileType, 'application/pdf'),
        fileSize: Number.isSafeInteger(source.fileSize) && source.fileSize >= 0 ? source.fileSize : 0,
        pdfBlob: source.pdfBase64 ? base64ToBlob(source.pdfBase64, source.fileType) : null,
        importedAt: stringValue(source.importedAt, now.toISOString()),
        restoredAt: now.toISOString(),
        parserVersion: Number.isSafeInteger(source.parserVersion) ? source.parserVersion : 1
    };
    for (const field of MONEY_FIELDS)
        record[field] = centsValue(source[field]);
    return record;
}

export async function restoreDocumentsBackup(profileId, backup, now = new Date()) {
    if (!backup || backup.kind !== DOCUMENTS_BACKUP_KIND || backup.formatVersion !== DOCUMENTS_BACKUP_FORMAT_VERSION)
        throw new TypeError('Backup de Documentos inválido.');
    const existing = await listPayslips(profileId);
    const existingCompetences = new Set(existing.map((item) => item.competence));
    let imported = 0;
    let skipped = 0;
    for (const source of backup.documents) {
        const record = restoredRecord(source, profileId, now);
        if (existingCompetences.has(record.competence)) {
            skipped += 1;
            continue;
        }
        await savePayslip(record);
        existingCompetences.add(record.competence);
        imported += 1;
    }
    return { imported, skipped };
}
