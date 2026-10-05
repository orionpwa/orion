const PATHS = {
    'bradesco': './assets/institutions/bradesco.png',
    'inter': './assets/institutions/inter.png',
    'mercado-pago': './assets/institutions/mercado-pago.png',
    'caju': './assets/institutions/caju.png'
};
export const VISIBLE_INSTITUTIONS_V0 = ['bradesco', 'inter', 'mercado-pago', 'caju', 'custom'];
export function institutionLogo(id, fallback, className) {
    const path = id ? PATHS[id] : undefined;
    if (path) {
        const img = document.createElement('img');
        img.className = className;
        img.src = path;
        img.alt = '';
        img.loading = 'eager';
        return img;
    }
    const span = document.createElement('span');
    span.className = className;
    span.textContent = fallback.trim().slice(0, 2).toUpperCase() || 'O';
    return span;
}
