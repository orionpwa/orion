import { el } from '../dom.js';
let toastTimer = null;
function clearToast() {
    const previous = document.querySelector('.toast');
    if (previous)
        previous.remove();
    if (toastTimer !== null)
        window.clearTimeout(toastTimer);
    toastTimer = null;
}
export function showToast(message, tone = 'default') {
    clearToast();
    const toast = el('div', `toast ${tone}`, [message]);
    toast.setAttribute('role', 'status');
    document.body.append(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    toastTimer = window.setTimeout(() => toast.remove(), 3000);
}
export function showActionToast(message, actionLabel, onAction) {
    clearToast();
    const action = el('button', 'toast-action', [actionLabel]);
    action.type = 'button';
    const toast = el('div', 'toast action-toast', [el('span', '', [message]), action]);
    toast.setAttribute('role', 'status');
    action.addEventListener('click', () => { clearToast(); onAction(); });
    document.body.append(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    toastTimer = window.setTimeout(() => toast.remove(), 6000);
}
export function showUpdateBanner(actionLabel, onAction) {
    const previous = document.querySelector('.update-banner-v0');
    if (previous)
        previous.remove();
    const action = el('button', 'update-banner-action-v0', [actionLabel]);
    action.type = 'button';
    const banner = el('div', 'update-banner-v0', [
        el('span', 'update-banner-message-v0', ['Atualização disponível']),
        action
    ]);
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    action.addEventListener('click', () => {
        banner.remove();
        onAction();
    });
    document.body.append(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));
}
