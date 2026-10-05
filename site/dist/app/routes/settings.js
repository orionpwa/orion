import { renderSettingsRootV0, renderSettingsProfileV0, renderSettingsDataV0, renderSettingsPrivacyV0, renderSettingsAboutV0, renderSettingsRestartV0 } from '../../presentation/settings.js';
const ROUTES = new Set(['settings', 'settings-profile', 'settings-data', 'settings-privacy', 'settings-about', 'settings-restart']);
export function renderSettingsRoute(state, repositories, applyProfile, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    const context = { repositories, profile: state.profile, onProfileChanged: applyProfile, onDataChanged: rerender };
    if (state.route === 'settings') {
        return renderSettingsRootV0(state.profile.displayName, {
            onProfile: () => { state.route = 'settings-profile'; rerender(); },
            onData: () => { state.route = 'settings-data'; rerender(); },
            onPrivacy: () => { state.route = 'settings-privacy'; rerender(); },
            onAbout: () => { state.route = 'settings-about'; rerender(); },
            onRestart: () => { state.route = 'settings-restart'; rerender(); }
        });
    }
    if (state.route === 'settings-profile') {
        return renderSettingsProfileV0(context, () => { state.route = 'settings'; rerender(); });
    }
    if (state.route === 'settings-data')
        return renderSettingsDataV0(context);
    if (state.route === 'settings-privacy')
        return renderSettingsPrivacyV0();
    if (state.route === 'settings-about')
        return renderSettingsAboutV0();
    return renderSettingsRestartV0(context);
}
