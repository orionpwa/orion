import { el } from './dom.js';
import { icon } from './icons.js';
const ROOT_NAVIGATION = [
    { route: 'summary', label: 'Resumo', icon: 'home' },
    { route: 'movements', label: 'Movimentos', icon: 'movement' },
    { route: 'planning', label: 'Planejar', icon: 'plan' },
    { route: 'accounts', label: 'Contas', icon: 'accounts' }
];
const ROOT_ROUTES = new Set(ROOT_NAVIGATION.map((item) => item.route));
const TITLES = {
    summary: 'Resumo',
    movements: 'Movimentos',
    planning: 'Planejar',
    accounts: 'Contas',
    settings: 'Ajustes',
    'movement-new': 'Novo movimento',
    'movement-detail': 'Movimento',
    'movement-edit': 'Editar movimento',
    'movement-filters': 'Filtros'
};
function parentRoute(route) {
    if (route === 'settings')
        return 'summary';
    if (route === 'movement-new' || route === 'movement-detail' || route === 'movement-filters')
        return 'movements';
    if (route === 'movement-edit')
        return 'movement-detail';
    return null;
}
function backLabel(route) {
    if (route === 'settings')
        return '‹ Resumo';
    if (route === 'movement-detail')
        return '‹ Movimentos';
    return 'Cancelar';
}
export function createShellV0(onNavigate, onCreateMovement) {
    let route = 'summary';
    const back = el('button', 'shell-back-v0');
    back.type = 'button';
    back.addEventListener('click', () => {
        const parent = parentRoute(route);
        if (parent)
            onNavigate(parent);
    });
    const title = el('h1', 'shell-title-v0', [TITLES.summary]);
    const settings = el('button', 'shell-action-v0', ['Ajustes']);
    settings.type = 'button';
    settings.addEventListener('click', () => onNavigate('settings'));
    const createMovement = el('button', 'shell-action-v0', ['Novo']);
    createMovement.type = 'button';
    createMovement.addEventListener('click', onCreateMovement);
    const leading = el('div', 'shell-header-leading-v0');
    const trailing = el('div', 'shell-header-trailing-v0');
    const header = el('header', 'app-header-v0', [leading, title, trailing]);
    const content = el('main', 'app-content-v0');
    const navigation = el('nav', 'bottom-nav-v0');
    navigation.setAttribute('aria-label', 'Navegação principal');
    const buttons = new Map();
    for (const item of ROOT_NAVIGATION) {
        const button = el('button', 'nav-item-v0', [
            icon(item.icon, 'nav-icon-v0'),
            el('span', 'nav-label-v0', [item.label])
        ]);
        button.type = 'button';
        button.addEventListener('click', () => onNavigate(item.route));
        buttons.set(item.route, button);
        navigation.append(button);
    }
    const shell = el('div', 'app-shell-v0', [header, content, navigation]);
    const sync = () => {
        title.textContent = TITLES[route];
        shell.dataset.route = route;
        leading.replaceChildren();
        trailing.replaceChildren();
        const parent = parentRoute(route);
        if (parent) {
            back.textContent = backLabel(route);
            leading.append(back);
        }
        if (route === 'summary')
            trailing.append(settings);
        if (route === 'movements')
            trailing.append(createMovement);
        const isRoot = ROOT_ROUTES.has(route);
        navigation.hidden = !isRoot;
        shell.classList.toggle('internal-route-v0', !isRoot);
        for (const [itemRoute, button] of buttons) {
            const active = itemRoute === route;
            button.classList.toggle('active', active);
            if (active)
                button.setAttribute('aria-current', 'page');
            else
                button.removeAttribute('aria-current');
        }
    };
    sync();
    return {
        shell,
        content,
        setActiveRoute(next) {
            route = next;
            sync();
        }
    };
}
