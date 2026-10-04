import { APP_VERSION } from '../../../app/version.js';
import { el } from '../../dom.js';
import { settingsRowV0 } from './shared.js';
export function renderSettingsRootV0(displayName, actions) {
    return el('div', 'settings-screen-v0 settings-root-v0', [
        el('section', 'settings-profile-summary-v0', [
            el('strong', '', [displayName]),
            el('span', '', ['Perfil local neste dispositivo'])
        ]),
        el('div', 'settings-list-v0', [
            settingsRowV0('Perfil', 'Nome exibido no Orion', displayName, actions.onProfile),
            settingsRowV0('Dados e backup', 'Backup, restauração e importação', '', actions.onData),
            settingsRowV0('Privacidade', 'Como seus dados são armazenados', 'Local', actions.onPrivacy),
            settingsRowV0('Sobre o Orion', 'Versão, instalação e suporte', APP_VERSION.replace('0.1.0-development.', '12.'), actions.onAbout)
        ]),
        el('section', 'settings-danger-zone-v0', [
            settingsRowV0('Recomeçar com uma base nova', 'Cria um backup antes de limpar os dados deste perfil', '', actions.onRestart, 'danger')
        ])
    ]);
}
