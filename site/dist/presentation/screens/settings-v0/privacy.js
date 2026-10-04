import { el } from '../../dom.js';
import { settingsInfoBlockV0 } from './shared.js';
export function renderSettingsPrivacyV0() {
    return el('div', 'settings-screen-v0 settings-internal-v0', [
        el('p', 'settings-intro-v0', ['Nesta versão, o Orion funciona localmente neste dispositivo.']),
        el('div', 'settings-info-list-v0', [
            settingsInfoBlockV0('Dados financeiros', 'Neste dispositivo', 'Contas, movimentações, dívidas e metas ficam no armazenamento local do app.'),
            settingsInfoBlockV0('Backup', 'Sob seu controle', 'O arquivo só é criado quando você solicita.'),
            settingsInfoBlockV0('Sincronização em nuvem', 'Desativada', 'Nenhum login ou sincronização em nuvem está ativo nesta versão.')
        ])
    ]);
}
