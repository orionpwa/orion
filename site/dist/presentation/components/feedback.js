import { el } from '../dom.js';
let feedbackTimer = null;
function clearFeedback() {
    const previous = document.querySelector('.feedback-toast-v0');
    if (previous)
        previous.remove();
    if (feedbackTimer !== null)
        window.clearTimeout(feedbackTimer);
    feedbackTimer = null;
}
export function showToast(message, tone = 'default') {
    clearFeedback();
    const toast = el('div', `feedback-toast-v0 ${tone}`, [
        el('span', 'feedback-toast-message-v0', [message])
    ]);
    toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
    toast.setAttribute('aria-atomic', 'true');
    document.body.append(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    feedbackTimer = window.setTimeout(() => {
        toast.remove();
        feedbackTimer = null;
    }, 3000);
}
export function showActionToast(message, actionLabel, onAction) {
    clearFeedback();
    const action = el('button', 'feedback-toast-action-v0', [actionLabel]);
    action.type = 'button';
    const toast = el('div', 'feedback-toast-v0 action', [
        el('span', 'feedback-toast-message-v0', [message]),
        action
    ]);
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    action.addEventListener('click', () => {
        clearFeedback();
        onAction();
    });
    document.body.append(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    feedbackTimer = window.setTimeout(() => {
        toast.remove();
        feedbackTimer = null;
    }, 6000);
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
    banner.setAttribute('aria-atomic', 'true');
    action.addEventListener('click', () => {
        banner.remove();
        onAction();
    });
    document.body.append(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));
}
