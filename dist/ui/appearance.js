const STORAGE_KEY = 'orion_ui_appearance_v1';
const DEFAULT_PREFERENCES = {
    theme: 'classic',
    autoByTime: false,
    intensity: 'balanced'
};
export const APPEARANCE_THEMES = [
    { id: 'classic', label: 'Clássico', support: 'Azul profundo e dourado' },
    { id: 'aurora', label: 'Aurora', support: 'Verde e turquesa' },
    { id: 'ruby', label: 'Rubi', support: 'Rosa, rubi e vinho' },
    { id: 'violet', label: 'Violeta', support: 'Roxo e índigo' },
    { id: 'copper', label: 'Cobre', support: 'Cobre e sálvia' }
];
function isTheme(value) {
    return value === 'classic' || value === 'aurora' || value === 'ruby' || value === 'violet' || value === 'copper';
}
function isIntensity(value) {
    return value === 'soft' || value === 'balanced' || value === 'vivid';
}
export function loadAppearancePreferences() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return DEFAULT_PREFERENCES;
        const parsed = JSON.parse(raw);
        return {
            theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_PREFERENCES.theme,
            autoByTime: parsed.autoByTime === true,
            intensity: isIntensity(parsed.intensity) ? parsed.intensity : DEFAULT_PREFERENCES.intensity
        };
    }
    catch {
        return DEFAULT_PREFERENCES;
    }
}
export function themeForHour(hour) {
    if (hour >= 5 && hour < 11)
        return 'aurora';
    if (hour >= 11 && hour < 17)
        return 'classic';
    if (hour >= 17 && hour < 21)
        return 'copper';
    return 'violet';
}
export function resolvedAppearanceTheme(preferences, now = new Date()) {
    return preferences.autoByTime ? themeForHour(now.getHours()) : preferences.theme;
}
function themeColor(theme) {
    if (theme === 'aurora')
        return '#03110f';
    if (theme === 'ruby')
        return '#12050b';
    if (theme === 'violet')
        return '#09071a';
    if (theme === 'copper')
        return '#0d0d0a';
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
