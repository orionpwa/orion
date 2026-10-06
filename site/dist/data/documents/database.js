const DB_NAME = 'orion_documents_v1';
const DB_VERSION = 1;
const STORE = 'payslips';

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

let databasePromise = null;
function openDocumentsDatabase() {
    if (databasePromise)
        return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE)) {
                const store = database.createObjectStore(STORE, { keyPath: 'id' });
                store.createIndex('profileId', 'profileId', { unique: false });
                store.createIndex('competence', 'competence', { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o arquivo local de documentos.'));
    });
    return databasePromise;
}

export async function listPayslips(profileId) {
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    const index = store.index('profileId');
    const items = await requestResult(index.getAll(profileId));
    return items.sort((left, right) => right.competence.localeCompare(left.competence) || right.importedAt.localeCompare(left.importedAt));
}

export async function getPayslip(id) {
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(STORE, 'readonly');
    return requestResult(transaction.objectStore(STORE).get(id));
}

export async function savePayslip(record) {
    const existing = (await listPayslips(record.profileId)).find((item) => item.competence === record.competence && item.id !== record.id);
    if (existing)
        throw new RangeError('Já existe um holerite salvo para esta competência. Exclua o anterior antes de importar novamente.');
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(record);
    await transactionDone(transaction);
    return record;
}

export async function deletePayslip(profileId, id) {
    const current = await getPayslip(id);
    if (!current || current.profileId !== profileId)
        throw new TypeError('Holerite não encontrado.');
    const database = await openDocumentsDatabase();
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(id);
    await transactionDone(transaction);
}

export const DOCUMENTS_DATABASE_NAME = DB_NAME;
