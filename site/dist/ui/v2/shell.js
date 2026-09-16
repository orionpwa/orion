import { el } from '../dom.js';
import { icon } from '../icons.js';
function initialFor(name) {
    return name.trim().charAt(0).toUpperCase() || 'O';
}
function daypartGreeting(now = new Date()) {
    const hour = now.getHours();
    if (hour < 12)
        return 'Bom dia';
    if (hour < 18)
        return 'Boa tarde';
    return 'Boa noite';
}
function routeContext(route, profile) {
    if (route === 'home')
        return [`${daypartGreeting()}, ${profile.displayName}!`, 'Disciplina hoje. Mais liberdade amanhã.'];
    if (route === 'movements')
        return ['Movimentos', 'Acompanhe o que realmente mudou no seu dinheiro.'];
    if (route === 'planning')
        return ['Planejar', 'Organize o que vem pela frente, sem complicação.'];
    if (route === 'investments')
        return ['Investimentos', 'Aprofunde quando fizer sentido para você.'];
    if (route === 'accounts')
        return ['Contas', 'Onde seu dinheiro está, sem ruído.'];
    return ['Configurações', 'Seu Orion, do seu jeito.'];
}
function brandMark() {
    return el('span', 'orion-brand-mark-v2', [el('span', '', ['✦'])]);
}
export function createShellV2(profile, onNavigate, onCreate) {
    let currentProfile = profile;
    let currentRoute = 'home';
    const brand = el('div', 'orion-brand-v2', [
        brandMark(),
        el('div', 'orion-brand-copy-v2', [
            el('strong', '', ['ORION FINANCE']),
            el('small', '', ['SUAS FINANÇAS. NO SEU RITMO.'])
        ])
    ]);
    const profileButton = el('button', 'profile-chip-v2', [initialFor(profile.displayName)]);
    profileButton.type = 'button';
    profileButton.setAttribute('aria-label', 'Abrir configurações');
    profileButton.addEventListener('click', () => onNavigate('settings'));
    const top = el('div', 'orion-header-top-v2', [brand, profileButton]);
    const contextTitle = el('h1', 'orion-context-title-v2');
    const contextSupport = el('p', 'orion-context-support-v2');
    const context = el('div', 'orion-context-v2', [contextTitle, contextSupport]);
    const header = el('header', 'orion-header-v2', [top, context]);
    const content = el('main', 'app-content');
    const dock = el('nav', 'bottom-dock bottom-dock-v2');
    dock.setAttribute('aria-label', 'Navegação principal');
    const routes = [
        { route: 'home', label: 'Início', iconName: 'home' },
        { route: 'movements', label: 'Mov.', iconName: 'movement' },
        { route: 'planning', label: 'Planejar', iconName: 'plan' },
        { route: 'settings', label: 'Ajustes', iconName: 'info' }
    ];
    const routeButtons = new Map();
    const appendRoute = (item) => {
        const node = el('button', 'dock-item dock-item-v2', [icon(item.iconName), el('span', '', [item.label])]);
        node.type = 'button';
        node.dataset.route = item.route;
        node.addEventListener('click', () => onNavigate(item.route));
        routeButtons.set(item.route, node);
        dock.append(node);
    };
    appendRoute(routes[0]);
    appendRoute(routes[1]);
    const fab = el('button', 'dock-fab dock-fab-v2', [icon('plus')]);
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Nova movimentação');
    fab.addEventListener('click', onCreate);
    dock.append(fab);
    appendRoute(routes[2]);
    appendRoute(routes[3]);
    const shell = el('div', 'app-shell app-shell-v2', [header, content, dock]);
    const updateContext = () => {
        const [title, support] = routeContext(currentRoute, currentProfile);
        contextTitle.textContent = title;
        contextSupport.textContent = support;
    };
    updateContext();
    return {
        shell,
        content,
        setActiveRoute(route) {
            currentRoute = route;
            shell.dataset.route = route;
            updateContext();
            for (const [key, value] of routeButtons) {
                const active = key === route;
                value.classList.toggle('active', active);
                if (active)
                    value.setAttribute('aria-current', 'page');
                else
                    value.removeAttribute('aria-current');
            }
            profileButton.classList.toggle('active', route === 'settings');
            if (route === 'settings')
                profileButton.setAttribute('aria-current', 'page');
            else
                profileButton.removeAttribute('aria-current');
        },
        setProfile(next) {
            currentProfile = next;
            profileButton.textContent = initialFor(next.displayName);
            profileButton.setAttribute('aria-label', `Configurações de ${next.displayName}`);
            updateContext();
        }
    };
}
