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
    patrimony: 'Patrimônio',
    'patrimony-investments': 'Investimentos',
    'patrimony-investment-new': 'Novo investimento',
    'patrimony-investment-detail': 'Investimento',
    'patrimony-investment-trade': 'Registrar operação',
    'patrimony-assets': 'Outros ativos',
    'patrimony-asset-new': 'Novo ativo',
    'patrimony-asset-detail': 'Ativo',
    'patrimony-asset-edit': 'Editar ativo',
    'patrimony-asset-value': 'Atualizar valor',
    documents: 'Documentos',
    'document-new': 'Ler holerite',
    'document-detail': 'Holerite',
    settings: 'Ajustes',
    'settings-profile': 'Perfil',
    'settings-data': 'Dados e backup',
    'settings-privacy': 'Privacidade',
    'settings-about': 'Sobre o Orion',
    'settings-restart': 'Recomeçar',
    'movement-new': 'Novo movimento',
    'movement-detail': 'Movimento',
    'movement-edit': 'Editar movimento',
    'movement-filters': 'Filtros',
    'planning-commitments': 'Compromissos',
    'planning-commitment-new': 'Novo compromisso',
    'planning-commitment-detail': 'Compromisso',
    'planning-commitment-edit': 'Editar compromisso',
    'planning-commitment-payment': 'Registrar ocorrência',
    'planning-debts': 'Dívidas',
    'planning-debt-new': 'Nova dívida',
    'planning-debt-detail': 'Dívida',
    'planning-debt-edit': 'Editar dívida',
    'planning-debt-payment': 'Registrar pagamento',
    'planning-allocations': 'Metas e reservas',
    'planning-allocation-new': 'Nova meta ou reserva',
    'planning-allocation-detail': 'Meta ou reserva',
    'planning-allocation-edit': 'Editar informações',
    'planning-allocation-adjust': 'Ajustar valor reservado',
    'account-new': 'Nova conta',
    'account-detail': 'Conta',
    'account-edit': 'Editar conta',
    'card-new': 'Novo cartão',
    'card-detail': 'Cartão',
    'card-edit': 'Editar cartão',
    'card-payment': 'Pagar fatura'
};

function parentRoute(route) {
    if (route === 'patrimony' || route === 'settings' || route === 'documents')
        return 'summary';
    if (route === 'document-new' || route === 'document-detail')
        return 'documents';
    if (route === 'patrimony-assets' || route === 'patrimony-investments')
        return 'patrimony';
    if (route === 'patrimony-investment-new' || route === 'patrimony-investment-detail')
        return 'patrimony-investments';
    if (route === 'patrimony-investment-trade')
        return 'patrimony-investment-detail';
    if (route === 'patrimony-asset-new' || route === 'patrimony-asset-detail')
        return 'patrimony-assets';
    if (route === 'patrimony-asset-edit' || route === 'patrimony-asset-value')
        return 'patrimony-asset-detail';
    if (route === 'settings-profile' || route === 'settings-data' || route === 'settings-privacy' || route === 'settings-about' || route === 'settings-restart')
        return 'settings';
    if (route === 'movement-new' || route === 'movement-detail' || route === 'movement-filters')
        return 'movements';
    if (route === 'movement-edit')
        return 'movement-detail';
    if (route === 'planning-commitments' || route === 'planning-debts' || route === 'planning-allocations')
        return 'planning';
    if (route === 'planning-commitment-new' || route === 'planning-commitment-detail')
        return 'planning-commitments';
    if (route === 'planning-commitment-edit' || route === 'planning-commitment-payment')
        return 'planning-commitment-detail';
    if (route === 'planning-debt-new' || route === 'planning-debt-detail')
        return 'planning-debts';
    if (route === 'planning-debt-edit' || route === 'planning-debt-payment')
        return 'planning-debt-detail';
    if (route === 'planning-allocation-new' || route === 'planning-allocation-detail')
        return 'planning-allocations';
    if (route === 'planning-allocation-edit' || route === 'planning-allocation-adjust')
        return 'planning-allocation-detail';
    if (route === 'account-new' || route === 'account-detail')
        return 'accounts';
    if (route === 'account-edit')
        return 'account-detail';
    if (route === 'card-new' || route === 'card-detail')
        return 'accounts';
    if (route === 'card-edit' || route === 'card-payment')
        return 'card-detail';
    return null;
}

function backLabel(route) {
    if (route === 'patrimony' || route === 'settings' || route === 'documents')
        return '‹ Resumo';
    if (route === 'document-new' || route === 'document-detail')
        return '‹ Documentos';
    if (route === 'patrimony-assets' || route === 'patrimony-investments')
        return '‹ Patrimônio';
    if (route === 'patrimony-investment-detail')
        return '‹ Investimentos';
    if (route === 'patrimony-asset-detail')
        return '‹ Ativos';
    if (route === 'settings-profile' || route === 'settings-data' || route === 'settings-privacy' || route === 'settings-about' || route === 'settings-restart')
        return '‹ Ajustes';
    if (route === 'movement-detail')
        return '‹ Movimentos';
    if (route === 'planning-commitments' || route === 'planning-debts' || route === 'planning-allocations')
        return '‹ Planejar';
    if (route === 'planning-commitment-detail')
        return '‹ Compromissos';
    if (route === 'planning-debt-detail')
        return '‹ Dívidas';
    if (route === 'planning-allocation-detail')
        return '‹ Metas';
    if (route === 'account-detail' || route === 'card-detail')
        return '‹ Contas';
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
