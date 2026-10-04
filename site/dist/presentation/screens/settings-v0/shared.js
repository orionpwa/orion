import { el } from '../../dom.js';
export function settingsRowV0(title, support, value, onClick, tone = '') {
    const row = el('button', `settings-row-v0 ${tone}`.trim(), [
        el('span', 'settings-row-copy-v0', [
            el('strong', '', [title]),
            el('small', '', [support])
        ]),
        value ? el('span', 'settings-row-value-v0', [value]) : el('span', 'settings-row-value-v0'),
        el('span', 'settings-row-chevron-v0', ['›'])
    ]);
    row.type = 'button';
    row.addEventListener('click', onClick);
    return row;
}
export function settingsActionV0(title, support, onClick, tone = '') {
    const action = el('button', `settings-action-v0 ${tone}`.trim(), [
        el('span', 'settings-row-copy-v0', [
            el('strong', '', [title]),
            el('small', '', [support])
        ]),
        el('span', 'settings-row-chevron-v0', ['›'])
    ]);
    action.type = 'button';
    action.addEventListener('click', onClick);
    return action;
}
export function settingsErrorV0() {
    const element = el('div', 'settings-error-v0');
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.hidden = true;
    return {
        element,
        show(message) { element.textContent = message; element.hidden = false; },
        clear() { element.hidden = true; element.textContent = ''; }
    };
}
export function settingsInfoBlockV0(label, value, support = '') {
    const children = [el('span', 'settings-info-label-v0', [label]), el('strong', 'settings-info-value-v0', [value])];
    if (support)
        children.push(el('small', 'settings-info-support-v0', [support]));
    return el('div', 'settings-info-block-v0', children);
}
export function settingsConfirmationV0(title, message, confirmLabel, onConfirm, onCancel) {
    const confirm = el('button', 'settings-primary-action-v0', [confirmLabel]);
    confirm.type = 'button';
    confirm.addEventListener('click', () => onConfirm(confirm));
    const cancel = el('button', 'settings-secondary-action-v0', ['Cancelar']);
    cancel.type = 'button';
    cancel.addEventListener('click', onCancel);
    return el('section', 'settings-confirmation-v0', [
        el('strong', '', [title]),
        el('p', '', [message]),
        el('div', 'settings-confirmation-actions-v0', [cancel, confirm])
    ]);
}
