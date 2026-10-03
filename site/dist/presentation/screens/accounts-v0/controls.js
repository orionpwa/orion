import { el } from '../../dom.js';
export function accountChoiceFieldV0(label, options, value = '', placeholder = 'Selecione') {
    const control = el('button', 'account-field-control-v0 account-choice-trigger-v0');
    control.type = 'button';
    control.value = value;
    control.setAttribute('aria-label', label);
    control.setAttribute('aria-expanded', 'false');
    const valueLabel = el('span', 'account-choice-value-v0');
    control.append(valueLabel, el('span', 'account-choice-chevron-v0', ['›']));
    const choices = el('div', 'account-choice-list-v0');
    const choicesId = `account-choice-${crypto.randomUUID()}`;
    choices.id = choicesId;
    choices.setAttribute('role', 'radiogroup');
    choices.setAttribute('aria-label', label);
    control.setAttribute('aria-controls', choicesId);
    choices.hidden = true;
    const buttons = [];
    const labelFor = (next) => options.find((item) => item.value === next)?.label ?? placeholder;
    const sync = () => {
        valueLabel.textContent = labelFor(control.value);
        for (const button of buttons)
            button.setAttribute('aria-checked', String(button.value === control.value));
    };
    const close = () => {
        choices.hidden = true;
        control.setAttribute('aria-expanded', 'false');
    };
    for (const item of options) {
        const copy = [el('strong', '', [item.label])];
        if (item.description)
            copy.push(el('small', '', [item.description]));
        const button = el('button', 'account-choice-option-v0', [el('span', '', copy)]);
        button.type = 'button';
        button.value = item.value;
        button.setAttribute('role', 'radio');
        button.addEventListener('click', () => {
            control.value = item.value;
            sync();
            close();
            control.focus();
            control.dispatchEvent(new Event('change'));
        });
        buttons.push(button);
        choices.append(button);
    }
    control.addEventListener('click', () => {
        if (control.disabled)
            return;
        const opening = choices.hidden;
        choices.hidden = !opening;
        control.setAttribute('aria-expanded', String(opening));
    });
    choices.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape')
            return;
        event.preventDefault();
        close();
        control.focus();
    });
    sync();
    return {
        control,
        element: el('div', 'account-field-v0', [el('span', 'account-field-label-v0', [label]), control, choices]),
        setValue(next) { control.value = next; sync(); close(); }
    };
}
export function accountInputFieldV0(label, value = '') {
    const input = document.createElement('input');
    input.className = 'account-field-control-v0';
    input.type = 'text';
    input.value = value;
    input.setAttribute('aria-label', label);
    return { input, element: el('label', 'account-field-v0', [el('span', 'account-field-label-v0', [label]), input]) };
}
export function accountMoneyFieldV0(label, value = '') {
    const field = accountInputFieldV0(label, value);
    field.input.inputMode = 'decimal';
    field.input.placeholder = '0,00';
    return field;
}
export function accountErrorV0() {
    const element = el('div', 'account-inline-error-v0');
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
