import { renderSettings } from './screens/settings.js';
export async function renderSettingsV3(repositories, profile, onProfileChanged, onDataChanged) {
    const root = await renderSettings(repositories, profile, onProfileChanged, onDataChanged);
    root.classList.remove('screen');
    root.classList.add('screen-v3', 'settings-screen-v3');
    root.querySelector('.screen-heading')?.remove();
    return root;
}
