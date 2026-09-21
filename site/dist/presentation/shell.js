import { el } from './dom.js';
import { icon } from './icons.js';
import { brandLockup } from './brand.js';
function initialFor(name) { return name.trim().charAt(0).toUpperCase() || 'O'; }
function greeting(now = new Date()) { const h = now.getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function context(route, profile) {
    if (route === 'home')
        return [`${greeting()}, ${profile.displayName}!`, 'Disciplina hoje. Mais liberdade amanhã.'];
    if (route === 'movements')
        return ['Movimentações', 'Tudo que entrou e saiu, sem ruído.'];
    if (route === 'planning')
        return ['Planejar', 'O que precisa acontecer daqui para frente.'];
    if (route === 'accounts')
        return ['Contas', 'Onde seu dinheiro está, sem ruído.'];
    return ['Configurações', 'Seu Orion, do seu jeito.'];
}
export function createShellV3(profile, onNavigate, onCreate) {
    let p = profile;
    let route = 'home';
    const profileButton = el('button', 'profile-chip-v3', [initialFor(profile.displayName)]);
    profileButton.type = 'button';
    profileButton.setAttribute('aria-label', 'Abrir configurações');
    profileButton.addEventListener('click', () => onNavigate('settings'));
    const title = el('h1', 'context-title-v3');
    const support = el('p', 'context-support-v3');
    const header = el('header', 'app-header-v3', [el('div', 'header-top-v3', [brandLockup(), profileButton]), el('div', 'header-context-v3', [title, support])]);
    const content = el('main', 'app-content-v3');
    const nav = el('nav', 'bottom-dock-v3');
    nav.setAttribute('aria-label', 'Navegação principal');
    const items = [
        { route: 'home', label: 'Início', icon: 'home' }, { route: 'movements', label: 'Mov.', icon: 'movement' }, { route: 'planning', label: 'Planejar', icon: 'plan' }, { route: 'accounts', label: 'Contas', icon: 'accounts' }
    ];
    const buttons = new Map();
    const add = (it) => { const b = el('button', 'dock-item-v3', [icon(it.icon, 'dock-icon-v3'), el('span', '', [it.label])]); b.type = 'button'; b.addEventListener('click', () => onNavigate(it.route)); buttons.set(it.route, b); nav.append(b); };
    add(items[0]);
    add(items[1]);
    const fab = el('button', 'dock-fab-v3', [icon('plus', 'dock-fab-icon-v3')]);
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Nova movimentação');
    fab.addEventListener('click', onCreate);
    nav.append(fab);
    add(items[2]);
    add(items[3]);
    const shell = el('div', 'app-shell-v3', [header, content, nav]);
    const update = () => { const [a, b] = context(route, p); title.textContent = a; support.textContent = b; shell.dataset.route = route; };
    update();
    return { shell, content, setActiveRoute(next) { route = next; update(); for (const [r, b] of buttons) {
            const active = r === next;
            b.classList.toggle('active', active);
            if (active)
                b.setAttribute('aria-current', 'page');
            else
                b.removeAttribute('aria-current');
        } profileButton.classList.toggle('active', next === 'settings'); }, setProfile(next) { p = next; profileButton.textContent = initialFor(next.displayName); update(); } };
}
