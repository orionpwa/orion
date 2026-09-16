import { el } from './dom.js';
import { icon } from './icons.js';
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
        return ['Movimentações', 'Tudo que entrou, saiu ou mudou de lugar.'];
    if (route === 'planning')
        return ['Planejar', 'Seus próximos passos, com clareza e sem complicação.'];
    if (route === 'investments')
        return ['Investimentos', 'Aprofunde sua carteira quando fizer sentido.'];
    if (route === 'accounts')
        return ['Contas', 'Onde seu dinheiro está, sem ruído.'];
    return ['Configurações', 'Do seu jeito. Para a sua jornada.'];
}
export function createShell(profile, onNavigate, onCreate) {
    let currentProfile = profile;
    let currentRoute = 'home';
    const brand = el('div', 'brand-lockup', [
        el('span', 'brand-symbol', [el('span', 'brand-star', ['✦'])]),
        el('div', 'brand-copy', [el('small', '', ['ORION FINANCE']), el('span', '', ['SUAS FINANÇAS. NO SEU RITMO.'])])
    ]);
    const profileButton = el('button', 'profile-chip', [initialFor(profile.displayName)]);
    profileButton.type = 'button';
    profileButton.setAttribute('aria-label', 'Conta e configurações');
    profileButton.addEventListener('click', () => onNavigate('settings'));
    const contextTitle = el('strong', 'app-header-context-title');
    const contextSupport = el('span', 'app-header-context-support');
    const context = el('div', 'app-header-context', [contextTitle, contextSupport]);
    const headerTop = el('div', 'app-header-top', [brand, profileButton]);
    const header = el('header', 'app-header', [headerTop, context]);
    const content = el('main', 'app-content');
    const updateContext = () => {
        const [title, support] = routeContext(currentRoute, currentProfile);
        contextTitle.textContent = title;
        contextSupport.textContent = support;
    };
    updateContext();
    const dock = el('nav', 'bottom-dock');
    dock.setAttribute('aria-label', 'Navegação principal');
    const routes = [
        { route: 'home', label: 'Início', iconName: 'home' },
        { route: 'movements', label: 'Mov.', iconName: 'movement' },
        { route: 'planning', label: 'Planejar', iconName: 'plan' },
        { route: 'accounts', label: 'Contas', iconName: 'accounts' }
    ];
    const routeButtons = new Map();
    const appendRoute = (item) => {
        const node = el('button', 'dock-item', [icon(item.iconName), el('span', '', [item.label])]);
        node.type = 'button';
        node.dataset.route = item.route;
        node.addEventListener('click', () => onNavigate(item.route));
        routeButtons.set(item.route, node);
        dock.append(node);
    };
    appendRoute(routes[0]);
    appendRoute(routes[1]);
    const fab = el('button', 'dock-fab', [icon('plus')]);
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Nova movimentação');
    fab.addEventListener('click', onCreate);
    dock.append(fab);
    appendRoute(routes[2]);
    appendRoute(routes[3]);
    const shell = el('div', 'app-shell', [header, content, dock]);
    shell.dataset.route = currentRoute;
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
            profileButton.setAttribute('aria-label', `Conta de ${next.displayName}`);
            updateContext();
        }
    };
}
