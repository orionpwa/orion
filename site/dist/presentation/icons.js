import { el } from './dom.js';
const PATHS = {
    home: ['M3.5 10.5 12 3.5l8.5 7', 'M5.5 9.2V20h13V9.2', 'M9.2 20v-5.4h5.6V20'],
    movement: ['M8 4v16', 'm4 8-4-4-4 4', 'M16 20V4', 'm-4 4 4 4 4-4'],
    plan: ['M4 6h16v14H4z', 'M8 3.5v5', 'M16 3.5v5', 'M4 10.5h16', 'm8 14 1.8 1.8L16 13.6'],
    accounts: ['M4 7h16v12H4z', 'M4 10.5h16', 'M15.5 14.5h2.5', 'M7 7V5h10v2'],
    fiscal: ['M7 3h10l3 3v15H7z', 'M17 3v4h4', 'M10 11h7', 'M10 15h7', 'm10 18 1.7 1.7L15 16.4'],
    plus: ['M12 5v14', 'M5 12h14'],
    chevron: ['m9 6 6 6-6 6'],
    wallet: ['M4 7h16v12H4z', 'M4 10h16', 'M15 14h3'],
    close: ['M6 6l12 12', 'M18 6 6 18'],
    check: ['m5 12 4 4L19 6'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
    backup: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
    restore: ['M12 21V9', 'm17 14-5-5-5 5', 'M5 3h14'],
    info: ['M12 11v6', 'M12 7h.01', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
    refresh: ['M20 7v5h-5', 'M4 17v-5h5', 'M6.1 9A7 7 0 0 1 18.6 7L20 12', 'M17.9 15A7 7 0 0 1 5.4 17L4 12'],
    search: ['m21 21-4.35-4.35', 'M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z'],
    filter: ['M4 6h16', 'M7 12h10', 'M10 18h4'],
    income: ['M12 20V6', 'm6 12-6-6-6 6'],
    expense: ['M12 4v14', 'm6 12-6 6-6-6'],
    transfer: ['M7 7h11', 'm15 4 4 3-4 3', 'M17 17H6', 'm9 20-4-3 4-3'],
    payment: ['M4 7h16v10H4z', 'M4 10h16', 'M15 14h3'],
    investment: ['M4 18 9 13l4 4 7-9', 'M16 8h4v4'],
    palette: ['M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h2a7 7 0 0 0-2-10Z', 'M7.5 9h.01', 'M10 6.5h.01', 'M15 7h.01'],
    shield: ['M12 3 5 6v5c0 4.6 2.8 7.5 7 10 4.2-2.5 7-5.4 7-10V6l-7-3Z', 'm9 12 2 2 4-5']
};
export function icon(name, className = 'icon') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add(className);
    for (const d of PATHS[name]) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svg.append(path);
    }
    return svg;
}
export function iconButton(name, label, onClick) {
    const node = el('button', 'icon-button', [icon(name)]);
    node.type = 'button';
    node.setAttribute('aria-label', label);
    node.addEventListener('click', onClick);
    return node;
}
