import { el } from '../../dom.js';
export function planningChoiceFieldV0(label, options, value = '', placeholder = 'Selecione') {
    const control = el('button', 'planning-field-control-v0 planning-choice-trigger-v0');
    control.type = 'button';
    control.value = value;
    control.setAttribute('aria-label', label);
    control.setAttribute('aria-expanded', 'false');
    const valueLabel = el('span', 'planning-choice-value-v0');
    control.append(valueLabel, el('span', 'planning-choice-chevron-v0', ['›']));
    const choices = el('div', 'planning-choice-list-v0');
    choices.hidden = true;
    const choiceButtons = [];
    const labelFor = (next) => options.find((item) => item.value === next)?.label ?? placeholder;
    const sync = () => {
        valueLabel.textContent = labelFor(control.value);
        for (const button of choiceButtons)
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
        const button = el('button', 'planning-choice-option-v0', [el('span', '', copy)]);
        button.type = 'button';
        button.value = item.value;
        button.setAttribute('role', 'radio');
        button.addEventListener('click', () => {
            control.value = item.value;
            sync();
            close();
            control.dispatchEvent(new Event('change'));
        });
        choiceButtons.push(button);
        choices.append(button);
    }
    control.addEventListener('click', () => {
        if (control.disabled)
            return;
        const opening = choices.hidden;
        choices.hidden = !opening;
        control.setAttribute('aria-expanded', String(opening));
    });
    sync();
    return {
        control,
        element: el('div', 'planning-field-v0', [el('span', 'planning-field-label-v0', [label]), control, choices]),
        setValue(next) {
            control.value = next;
            sync();
            close();
        }
    };
}
export function planningInputFieldV0(label, type, value = '', inputMode) {
    const input = document.createElement('input');
    input.className = 'planning-field-control-v0';
    input.type = type;
    input.value = value;
    if (inputMode)
        input.inputMode = inputMode;
    input.setAttribute('aria-label', label);
    return {
        input,
        element: el('label', 'planning-field-v0', [el('span', 'planning-field-label-v0', [label]), input])
    };
}
export function planningMoneyFieldV0(label = 'Valor', value = '') {
    const field = planningInputFieldV0(label, 'text', value, 'decimal');
    field.input.placeholder = '0,00';
    field.input.classList.add('planning-money-input-v0');
    return field;
}
export function planningErrorV0() {
    const element = el('div', 'planning-inline-error-v0');
    element.hidden = true;
    return {
        element,
        show(message) { element.textContent = message; element.hidden = false; },
        clear() { element.hidden = true; element.textContent = ''; }
    };
}
export function planningSubmitV0(label) {
    const button = el('button', 'planning-primary-action-v0', [label]);
    button.type = 'submit';
    return button;
}
