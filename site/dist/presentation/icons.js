import { el } from './dom.js';
const PATHS = {
    home: [
        'M4.75 4.75h6v6h-6z',
        'M13.25 4.75h6v4.25h-6z',
        'M13.25 11.25h6v8h-6z',
        'M4.75 13.25h6v6h-6z',
        { d: 'M14.65 12.65h3.2v5.2h-3.2z', fill: 'currentColor', stroke: 'none', className: 'nav-icon-fill' }
    ],
    movement: [
        'M5 7.25h11.5',
        'm14 4.75 2.5 2.5-2.5 2.5',
        'M19 16.75H7.5',
        'm10 14.25-2.5 2.5 2.5 2.5',
        { d: 'M10 10.25h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2Z', fill: 'currentColor', stroke: 'none', className: 'nav-icon-fill' }
    ],
    plan: [
        'M6 5.25h12a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.25a2 2 0 0 1 2-2Z',
        'M8 3.5v3.75',
        'M16 3.5v3.75',
        'M4 9.25h16',
        'm9 14.25 1.8 1.8 4-4.35',
        { d: 'M5.5 6.75h13v1.25h-13z', fill: 'currentColor', stroke: 'none', className: 'nav-icon-fill' }
    ],
    accounts: [
        'M6.25 5h10.5a2 2 0 0 1 2 2v1.25H6.25a2 2 0 0 0-2 2V7a2 2 0 0 1 2-2Z',
        'M5.25 8.25h13.5a2 2 0 0 1 2 2v7.75a2 2 0 0 1-2 2H5.25a2 2 0 0 1-2-2v-7.75a2 2 0 0 1 2-2Z',
        'M3.25 11h17.5',
        'M15.25 13h5.5v3.5h-5.5a1.75 1.75 0 1 1 0-3.5Z',
        { d: 'M6.25 13h4v2.5h-4z', fill: 'currentColor', stroke: 'none', className: 'nav-icon-fill' }
    ],
    fiscal: [
        'M6 3.75h8.25L18 7.5v12.75H6z',
        'M14.25 3.75v4H18',
        'M8.75 10.25h4.75',
        'M8.75 13h3.25',
        'm10.25 16.25 1.8 1.8 4-4.5',
        { d: 'M15 14.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z', fill: 'currentColor', stroke: 'none', className: 'nav-icon-fill' }
    ],
    food: ['M7 3v7.25', 'M4.5 3v4.25a2.5 2.5 0 0 0 5 0V3', 'M7 10.25V21', 'M16 3v18', 'M16 3c2.25 0 3.75 2.25 3.75 5.25S18.25 13.5 16 13.5'],
    housing: ['M3.5 10.5 12 3.5l8.5 7', 'M5.5 9v11.5h13V9', 'M9.5 20.5v-6h5v6'],
    transport: ['M5.25 15.5 6.75 9h10.5l1.5 6.5', 'M4 15.5h16v3.5H4z', 'M6.5 19v2', 'M17.5 19v2', 'M7.5 12.5h9'],
    health: ['M12 20s-7-4.35-7-9.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7 3.8C19 15.65 12 20 12 20Z', 'M9.5 12h5', 'M12 9.5v5'],
    subscriptions: ['M5 6.5h14v10H5z', 'm10.5 9 3 2-3 2', 'M8 19h8'],
    leisure: ['M8 8h8a5 5 0 0 1 4.7 6.7l-1.1 3.4a2 2 0 0 1-3.3.8L14.5 17h-5l-1.8 1.9a2 2 0 0 1-3.3-.8l-1.1-3.4A5 5 0 0 1 8 8Z', 'M7 12h3', 'M8.5 10.5v3', 'M15.5 11.5h.01', 'M17.5 13.5h.01'],
    education: ['M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z', 'M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z'],
    other: ['M5 5h4v4H5z', 'M15 5h4v4h-4z', 'M5 15h4v4H5z', 'M15 15h4v4h-4z'],
    salary: ['M4 7h16v10H4z', 'M4 10h16', 'M8 14h4', 'M16 13.5h.01'],
    award: ['M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L8 16.7l.9-5-3.6-3.5 5-.7Z'],
    benefit: ['M4 9h16v11H4z', 'M3 6h18v3H3z', 'M12 6v14'],
    sale: ['M3.5 12 12 3.5h7v7L11 20z', 'M16 8h.01'],
    refund: ['M20 11a8 8 0 1 1-2.35-5.65', 'M20 4v7h-7'],
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
    for (const segment of PATHS[name]) {
        const spec = typeof segment === 'string' ? { d: segment } : segment;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', spec.d);
        if (spec.fill)
            path.setAttribute('fill', spec.fill);
        if (spec.stroke)
            path.setAttribute('stroke', spec.stroke);
        if (spec.className)
            path.setAttribute('class', spec.className);
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
