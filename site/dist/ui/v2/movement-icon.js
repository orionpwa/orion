const SVG_NS = 'http://www.w3.org/2000/svg';
function svgIcon(paths, className) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('movement-glyph-v2', className);
    for (const d of paths) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        svg.append(path);
    }
    return svg;
}
const CATEGORY_PATHS = {
    'Alimentação': ['M4 3v7a3 3 0 0 0 6 0V3', 'M7 3v18', 'M15 3v18', 'M15 3c3 2 4 5 4 8h-4'],
    'Moradia': ['M3 11 12 4l9 7', 'M5 10v10h14V10', 'M9 20v-6h6v6'],
    'Transporte': ['M5 17h14', 'M6 17 4-10h8l2 10', 'M7 12h10', 'M8 20h.01', 'M16 20h.01'],
    'Saúde': ['M12 21s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.3-8 11-8 11Z', 'M9 12h6', 'M12 9v6'],
    'Assinaturas': ['M5 6h14v12H5z', 'M8 9h8', 'M8 13h5'],
    'Lazer': ['M8 10h8', 'M10 8v4', 'M7 16h.01', 'M17 16h.01', 'M5 7c-2 4-2 8 0 10l3-2h8l3 2c2-2 2-6 0-10-2-2-4-3-7-3s-5 1-7 3Z'],
    'Educação': ['M3 8 12 4l9 4-9 4-9-4Z', 'M6 10v5c3 2 9 2 12 0v-5', 'M21 9v6'],
    'Salário': ['M5 8h14v10H5z', 'M8 5h8v3', 'M8 13h8', 'M12 10v6'],
    'Benefício': ['M4 12h16', 'M12 4v16', 'M5 7h14v12H5z'],
    'Rendimento': ['M5 17 10 12l3 3 6-8', 'M15 7h4v4'],
    'Venda': ['M4 7h16l-2 13H6L4 7Z', 'M8 7l1-3h6l1 3'],
    'Reembolso': ['M8 7H4v4', 'M4 11a8 8 0 1 0 2-5'],
    'Outros': ['M6 12h.01', 'M12 12h.01', 'M18 12h.01']
};
export function movementIcon(transaction) {
    const category = 'categoryId' in transaction ? transaction.categoryId : undefined;
    if (category && CATEGORY_PATHS[category])
        return svgIcon(CATEGORY_PATHS[category], 'category');
    switch (transaction.kind) {
        case 'income':
        case 'yield':
        case 'asset-yield': return svgIcon(['M12 19V5', 'm6 11-6 6-6-6'], 'income');
        case 'expense': return svgIcon(['M12 5v14', 'm6-11 6 6 6-6'], 'expense');
        case 'transfer': return svgIcon(['M7 7h12', 'm15 3 4 4-4 4', 'M17 17H5', 'm9 13-4 4 4 4'], 'transfer');
        case 'credit-card-payment': return svgIcon(['M4 7h16v11H4z', 'M4 10h16', 'm8 15 2 2 4-5'], 'payment');
        case 'debt-payment': return svgIcon(['M7 4h10v16H7z', 'M9 8h6', 'M9 12h6', 'm9 16 2 2 4-5'], 'payment');
        case 'asset-contribution': return svgIcon(['M12 21V9', 'm7 14 5-5 5 5', 'M5 5h14'], 'asset');
        case 'asset-withdrawal': return svgIcon(['M12 3v12', 'm7 10 5 5 5-5', 'M5 19h14'], 'asset');
        case 'asset-valuation': return svgIcon(['M5 16 10 11l3 3 6-7', 'M15 7h4v4'], 'asset');
        default: return svgIcon(['M6 12h.01', 'M12 12h.01', 'M18 12h.01'], 'neutral');
    }
}
