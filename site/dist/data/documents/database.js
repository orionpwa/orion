const DB_NAME = 'orion_documents_v1';
const DB_VERSION = 2;
const PAYSLIPS_STORE = 'payslips';
const INCOME_REPORTS_STORE = 'incomeReports';

function requestResult(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Falha no armazenamento local de documentos.'));
    });
}

function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao salvar documento.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Operação de documento cancelada.'));
    });
}

function createPayslipsStore(database) {
    if (database.objectStoreNames.contains(PAYSLIPS_STORE))
        return;
    const store = database.createObjectStore(PAYSLIPS_STORE, { keyPath: 'id' });
    store.createIndex('profileId', 'profileId', { unique: false });
    store.createIndex('competence', 'competence', { unique: false });
}

function createIncomeReportsStore(database) {
    if (database.objectStoreNames.contains(INCOME_REPORTS_STORE))
        return;
    const store = database.createObjectStore(INCOME_REPORTS_STORE, { keyPath: 'id' });
    store.createIndex('profileId', 'profileId', { unique: false });
    store.createIndex('year', 'year', { unique: false });
}

let databasePromise = null;
function openDocumentsDatabase() {
    if (databasePromise)
        return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            createPayslipsStore(database);
            createIncomeReportsStore(database);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o arquivo local de documentos.'));
    });
    return databasePromise;
}

async function listByProfile(storeName, profileId) {
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    return requestResult(store.index('profileId').getAll(profileId));
}

export async function listPayslips(profileId) {
    const items = await listByProfile(PAYSLIPS_STORE, profileId);
    return items.sort((left, right) => right.competence.localeCompare(left.competence) || right.importedAt.localeCompare(left.importedAt));
}

export async function getPayslip(id) {
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(PAYSLIPS_STORE, 'readonly');
    return requestResult(transaction.objectStore(PAYSLIPS_STORE).get(id));
}

export async function savePayslip(record) {
    const existing = (await listPayslips(record.profileId)).find((item) => item.competence === record.competence && item.id !== record.id);
    if (existing)
        throw new RangeError('Já existe um holerite salvo para esta competência. Exclua o anterior antes de importar novamente.');
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(PAYSLIPS_STORE, 'readwrite');
    transaction.objectStore(PAYSLIPS_STORE).put(record);
    await transactionDone(transaction);
    return record;
}

export async function deletePayslip(profileId, id) {
    const current = await getPayslip(id);
    if (!current || current.profileId !== profileId)
        throw new TypeError('Holerite não encontrado.');
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(PAYSLIPS_STORE, 'readwrite');
    transaction.objectStore(PAYSLIPS_STORE).delete(id);
    await transactionDone(transaction);
}

export async function listIncomeReports(profileId) {
    const items = await listByProfile(INCOME_REPORTS_STORE, profileId);
    return items.sort((left, right) => right.year - left.year || (right.importedAt ?? '').localeCompare(left.importedAt ?? ''));
}

export async function getIncomeReport(id) {
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(INCOME_REPORTS_STORE, 'readonly');
    return requestResult(transaction.objectStore(INCOME_REPORTS_STORE).get(id));
}

export async function saveIncomeReport(record) {
    if (!Number.isInteger(record.year) || record.year < 2000 || record.year > 2200)
        throw new RangeError('Informe de Rendimentos sem ano-calendário válido.');
    const existing = (await listIncomeReports(record.profileId)).find((item) => item.year === record.year && (item.employerCnpj || '') === (record.employerCnpj || '') && item.id !== record.id);
    if (existing)
        throw new RangeError('Já existe um Informe de Rendimentos deste ano para esta fonte pagadora.');
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(INCOME_REPORTS_STORE, 'readwrite');
    transaction.objectStore(INCOME_REPORTS_STORE).put(record);
    await transactionDone(transaction);
    return record;
}

export async function deleteIncomeReport(profileId, id) {
    const current = await getIncomeReport(id);
    if (!current || current.profileId !== profileId)
        throw new TypeError('Informe de Rendimentos não encontrado.');
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(INCOME_REPORTS_STORE, 'readwrite');
    transaction.objectStore(INCOME_REPORTS_STORE).delete(id);
    await transactionDone(transaction);
}

export const DOCUMENTS_DATABASE_NAME = DB_NAME;
export const DOCUMENTS_DATABASE_VERSION = DB_VERSION;
