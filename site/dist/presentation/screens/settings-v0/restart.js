import { createProfileBackup } from '../../../data/backup/profile.js';
import { serializeBackup } from '../../../data/backup/model.js';
import { createFreshProfileData } from '../../../data/backup/fresh-profile.js';
import { replaceProfileDataAtomically } from '../../../data/backup/restore.js';
import { el } from '../../dom.js';
import { downloadTextFile } from '../../download.js';
import { settingsErrorV0 } from './shared.js';
export function renderSettingsRestartV0(context) {
    const error = settingsErrorV0();
    const restart = el('button', 'settings-primary-action-v0 danger', ['Recomeçar com uma base nova']);
    restart.type = 'button';
    restart.addEventListener('click', () => {
        error.clear();
        restart.disabled = true;
        void createProfileBackup(context.repositories, context.profile).then(async (backup) => {
            const day = new Date().toISOString().slice(0, 10);
            downloadTextFile(`orion-antes-de-recomecar-${day}.json`, serializeBackup(backup));
            await replaceProfileDataAtomically(context.profile.id, createFreshProfileData(context.profile));
            window.location.reload();
        }).catch((failure) => {
            restart.disabled = false;
            error.show(failure instanceof Error ? failure.message : 'Não foi possível preparar uma base nova.');
        });
    });
    return el('div', 'settings-screen-v0 settings-internal-v0', [
        el('section', 'settings-warning-v0', [
            el('strong', '', ['Isto limpa os dados deste perfil']),
            el('p', '', ['O Orion apaga os dados financeiros deste perfil e volta para a configuração inicial.']),
            el('p', '', ['Se quiser guardar a base atual, exporte um arquivo antes em Dados e backup. Use este caminho ao abandonar uma base de testes ou quando quiser recomeçar pelos saldos atuais.'])
        ]),
        error.element,
        restart
    ]);
}
