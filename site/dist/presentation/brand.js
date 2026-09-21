import { el } from './dom.js';
export function orionEmblem(className = 'orion-emblem') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add(className);
    const defs = document.createElementNS(svg.namespaceURI, 'defs');
    const grad = document.createElementNS(svg.namespaceURI, 'radialGradient');
    grad.id = 'orionStarGlow';
    grad.setAttribute('cx', '50%');
    grad.setAttribute('cy', '50%');
    grad.setAttribute('r', '65%');
    const s1 = document.createElementNS(svg.namespaceURI, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', '#fff');
    const s2 = document.createElementNS(svg.namespaceURI, 'stop');
    s2.setAttribute('offset', '32%');
    s2.setAttribute('stop-color', 'currentColor');
    const s3 = document.createElementNS(svg.namespaceURI, 'stop');
    s3.setAttribute('offset', '100%');
    s3.setAttribute('stop-color', 'currentColor');
    grad.append(s1, s2, s3);
    defs.append(grad);
    svg.append(defs);
    const orbit = document.createElementNS(svg.namespaceURI, 'ellipse');
    orbit.setAttribute('cx', '50');
    orbit.setAttribute('cy', '51');
    orbit.setAttribute('rx', '42');
    orbit.setAttribute('ry', '18');
    orbit.setAttribute('transform', 'rotate(-18 50 51)');
    orbit.setAttribute('fill', 'none');
    orbit.setAttribute('stroke', 'currentColor');
    orbit.setAttribute('stroke-width', '2.2');
    orbit.setAttribute('opacity', '.85');
    const star = document.createElementNS(svg.namespaceURI, 'polygon');
    star.setAttribute('points', '50,3 57,35 75,24 65,43 97,50 65,57 76,76 57,65 50,97 43,65 24,76 35,57 3,50 35,43 24,24 43,35');
    star.setAttribute('fill', 'url(#orionStarGlow)');
    star.setAttribute('stroke', 'rgba(255,255,255,.55)');
    star.setAttribute('stroke-width', '.8');
    const dot = document.createElementNS(svg.namespaceURI, 'circle');
    dot.setAttribute('cx', '88');
    dot.setAttribute('cy', '37');
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', 'currentColor');
    svg.append(orbit, star, dot);
    return svg;
}
export function brandLockup() {
    return el('div', 'brand-lockup-v3', [
        orionEmblem('brand-emblem-v3'),
        el('div', 'brand-copy-v3', [
            el('div', 'brand-title-v3', [el('strong', '', ['ORION']), el('span', '', [' FINANCE'])]),
            el('span', 'brand-tagline-v3', ['SUAS FINANÇAS. NO SEU RITMO.'])
        ])
    ]);
}
