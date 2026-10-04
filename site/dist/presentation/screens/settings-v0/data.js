import { createProfileBackup } from '../../../data/backup/profile.js';
import { serializeBackup } from '../../../data/backup/model.js';
import { parseBackup } from '../../../data/backup/validate.js';
import { rebindSingleProfileBackup } from '../../../data/backup/rebind.js';
import { replaceProfileDataAtomically } from '../../../data/backup/restore.js';
import { readJsonDocument } from '../../../data/import/json-document.js';
import { applyPreparedLegacyMigration, prepareLegacyMigration } from '../../../migration/legacy/apply.js';
import { el } from '../../dom.js';
import { downloadTextFile } from '../../download.js';
import { showToast } from '../../components/feedback.js';
import { settingsActionV0, settingsConfirmationV0 } from './shared.js';
function hiddenFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.zip,application/json,application/zip';
    input.className = 'visually-hidden';
    return input;
}
export function renderSettingsDataV0(context) {
    const fileInput = hiddenFileInput();
    const legacyInput = hiddenFileInput();
    const actionHost = el('div', 'settings-data-action-host-v0');
    const renderActions = () => {
        actionHost.replaceChildren(settingsActionV0('Criar backup', 'Baixa uma cópia dos seus dados para este dispositivo', () => {
            void createProfileBackup(context.repositories, context.profile).then((backup) => {
                const day = new Date().toISOString().slice(0, 10);
                downloadTextFile(`orion-backup-${day}.json`, serializeBackup(backup));
                showToast('Backup criado.', 'success');
            }).catch((failure) => showToast(failure instanceof Error ? failure.message : 'Não foi possível criar o backup.', 'error'));
        }), settingsActionV0('Restaurar backup', 'Substitui os dados atuais pelos dados de um backup', () => fileInput.click()), settingsActionV0('Trazer dados de outro Orion', 'Importa uma base antiga compatível', () => legacyInput.click()));
    };
    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file)
            return;
        void readJsonDocument(file).then((raw) => {
            const parsed = parseBackup(raw);
            const rebound = rebindSingleProfileBackup(parsed.data, context.profile);
            actionHost.replaceChildren(settingsConfirmationV0('Restaurar este backup?', 'Os dados atuais deste perfil serão substituídos pelos dados do arquivo selecionado.', 'Restaurar backup', (confirm) => {
                confirm.disabled = true;
                void replaceProfileDataAtomically(context.profile.id, rebound).then(() => {
                    const restored = rebound.profiles[0];
                    if (restored)
                        context.onProfileChanged(restored);
                    context.onDataChanged();
                    showToast('Backup restaurado.', 'success');
                    renderActions();
                }).catch((failure) => {
                    confirm.disabled = false;
                    showToast(failure instanceof Error ? failure.message : 'Não foi possível restaurar o backup.', 'error');
                });
            }, renderActions));
        }).catch((failure) => showToast(failure instanceof Error ? failure.message : 'Esse arquivo não é um backup válido.', 'error'));
        fileInput.value = '';
    });
    legacyInput.addEventListener('change', () => {
        const file = legacyInput.files?.[0];
        if (!file)
            return;
        void readJsonDocument(file).then(async (raw) => {
            const prepared = await prepareLegacyMigration(raw, context.profile.id);
            const counts = prepared.report.counts;
            const summary = `${counts.accounts ?? 0} contas · ${counts.transactions ?? 0} movimentações · ${counts.debts ?? 0} dívidas.`;
            actionHost.replaceChildren(settingsConfirmationV0('Trazer dados do Orion anterior?', `Encontramos ${summary} Antes de importar, o Orion criará um backup da base atual.`, 'Importar dados', (confirm) => {
                confirm.disabled = true;
                void createProfileBackup(context.repositories, context.profile).then(async (currentBackup) => {
                    const stamp = new Date().toISOString().slice(0, 10);
                    downloadTextFile(`orion-antes-da-importacao-${stamp}.json`, serializeBackup(currentBackup));
                    await applyPreparedLegacyMigration(prepared, context.profile.id);
                    const migrated = prepared.data.profiles[0];
                    if (migrated)
                        context.onProfileChanged(migrated);
                    context.onDataChanged();
                    showToast('Dados importados.', 'success');
                    renderActions();
                }).catch((failure) => {
                    confirm.disabled = false;
                    showToast(failure instanceof Error ? failure.message : 'Não foi possível importar os dados.', 'error');
                });
            }, renderActions));
        }).catch((failure) => showToast(failure instanceof Error ? failure.message : 'Esse arquivo não é compatível.', 'error'));
        legacyInput.value = '';
    });
    renderActions();
    return el('div', 'settings-screen-v0 settings-internal-v0', [
        el('p', 'settings-intro-v0', ['Seus dados continuam locais. Backup e restauração só acontecem quando você solicita.']),
        actionHost,
        fileInput,
        legacyInput
    ]);
}
