const STORAGE_KEY = 'orion_ui_appearance_v2';
const LEGACY_STORAGE_KEY = 'orion_ui_appearance_v1';
const DEFAULT_PREFERENCES = {
    theme: 'orion',
    autoByTime: false,
    intensity: 'balanced'
};
export const APPEARANCE_THEMES = [
    { id: 'orion', label: 'Orion', support: 'Azul-noite e violeta', palette: ['#07182c', '#5f72ff', '#45c8ff'] },
    { id: 'aurora', label: 'Aurora Verde', support: 'Verde e turquesa', palette: ['#061b19', '#18d9a5', '#4ce7d1'] },
    { id: 'ruby', label: 'Rubi Elegante', support: 'Rubi, vinho e blush', palette: ['#1a0811', '#ff477b', '#ff9b85'] },
    { id: 'cosmic', label: 'Roxo Cósmico', support: 'Índigo e violeta', palette: ['#111026', '#8b63ff', '#d376ff'] },
    { id: 'copper', label: 'Cobre & Sálvia', support: 'Cobre, verde suave e areia', palette: ['#171812', '#d8874c', '#91b59a'] },
    { id: 'glacial', label: 'Azul Glacial', support: 'Ciano, azul e prata', palette: ['#06172a', '#21d4f5', '#3b82f6'] },
    { id: 'noir', label: 'Noir Dourado', support: 'Obsidiana, ouro e marfim', palette: ['#0b0b0b', '#d4af37', '#f3e6bb'] }
];
function normalizeTheme(value) {
    if (value === 'orion' || value === 'aurora' || value === 'ruby' || value === 'cosmic' || value === 'copper' || value === 'glacial' || value === 'noir')
        return value;
    if (value === 'classic')
        return 'orion';
    if (value === 'violet')
        return 'cosmic';
    return null;
}
function normalizeIntensity(value) {
    if (value === 'soft' || value === 'balanced' || value === 'immersive')
        return value;
    if (value === 'vivid')
        return 'immersive';
    return null;
}
function parsePreferences(raw) {
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(raw);
        const theme = normalizeTheme(parsed.theme);
        const intensity = normalizeIntensity(parsed.intensity);
        if (!theme && !intensity && parsed.autoByTime !== true && parsed.autoByTime !== false)
            return null;
        return {
            theme: theme ?? DEFAULT_PREFERENCES.theme,
            autoByTime: parsed.autoByTime === true,
            intensity: intensity ?? DEFAULT_PREFERENCES.intensity
        };
    }
    catch {
        return null;
    }
}
export function loadAppearancePreferences() {
    try {
        const current = parsePreferences(localStorage.getItem(STORAGE_KEY));
        if (current)
            return current;
        const legacy = parsePreferences(localStorage.getItem(LEGACY_STORAGE_KEY));
        if (legacy) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
            return legacy;
        }
    }
    catch {
        // Aparência é opcional; falhas de storage nunca bloqueiam o Orion.
    }
    return DEFAULT_PREFERENCES;
}
export function themeForHour(hour) {
    if (hour >= 5 && hour < 10)
        return 'aurora';
    if (hour >= 10 && hour < 16)
        return 'glacial';
    if (hour >= 16 && hour < 19)
        return 'copper';
    if (hour >= 19 && hour < 23)
        return 'noir';
    return 'cosmic';
}
export function resolvedAppearanceTheme(preferences, now = new Date()) {
    return preferences.autoByTime ? themeForHour(now.getHours()) : preferences.theme;
}
function themeColor(theme) {
    if (theme === 'aurora')
        return '#03110f';
    if (theme === 'ruby')
        return '#12050b';
    if (theme === 'cosmic')
        return '#09071a';
    if (theme === 'copper')
        return '#0d0d0a';
    if (theme === 'glacial')
        return '#041221';
    if (theme === 'noir')
        return '#080808';
    return '#020912';
}
export function applyAppearance(preferences = loadAppearancePreferences(), now = new Date()) {
    const theme = resolvedAppearanceTheme(preferences, now);
    const root = document.documentElement;
    root.dataset.orionTheme = theme;
    root.dataset.orionIntensity = preferences.intensity;
    root.dataset.orionThemeMode = preferences.autoByTime ? 'auto' : 'manual';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
        meta.content = themeColor(theme);
    return theme;
}
export function saveAppearancePreferences(preferences) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
    catch {
        // Aparência é uma preferência local não crítica; o app continua funcional sem persistência visual.
    }
    return applyAppearance(preferences);
}
export function initializeAppearanceClock() {
    let current = applyAppearance();
    const refresh = () => {
        const preferences = loadAppearancePreferences();
        if (!preferences.autoByTime)
            return;
        const next = resolvedAppearanceTheme(preferences);
        if (next !== current)
            current = applyAppearance(preferences);
    };
    const timer = window.setInterval(refresh, 60_000);
    const onVisibility = () => {
        if (document.visibilityState === 'visible')
            refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
        window.clearInterval(timer);
        document.removeEventListener('visibilitychange', onVisibility);
    };
}
