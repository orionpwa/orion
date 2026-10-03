import { el } from '../../dom.js';
export function choiceFieldV0(label, options, value = '', placeholder) {
    const control = el('button', 'movement-field-control-v0 movement-choice-trigger-v0');
    control.type = 'button';
    control.value = value;
    control.setAttribute('aria-label', label);
    control.setAttribute('aria-expanded', 'false');
    const valueLabel = el('span', 'movement-choice-value-v0');
    const chevron = el('span', 'movement-choice-chevron-v0', ['›']);
    control.append(valueLabel, chevron);
    const choices = el('div', 'movement-choice-list-v0');
    const choicesId = `movement-choice-${crypto.randomUUID()}`;
    choices.id = choicesId;
    choices.setAttribute('role', 'radiogroup');
    choices.setAttribute('aria-label', label);
    control.setAttribute('aria-controls', choicesId);
    choices.hidden = true;
    const choiceButtons = [];
    const labelFor = (next) => options.find((item) => item.value === next)?.label ?? placeholder ?? 'Selecione';
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
        const button = el('button', 'movement-choice-option-v0', [item.label]);
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
        element: el('div', 'movement-field-v0', [el('span', 'movement-field-label-v0', [label]), control, choices]),
        setValue(next) {
            control.value = next;
            sync();
            close();
        }
    };
}
export function nativeInputFieldV0(label, type, value = '', inputMode) {
    const input = document.createElement('input');
    input.className = 'movement-field-control-v0';
    input.type = type;
    input.value = value;
    if (inputMode)
        input.inputMode = inputMode;
    input.setAttribute('aria-label', label);
    return {
        input,
        element: el('label', 'movement-field-v0', [el('span', 'movement-field-label-v0', [label]), input])
    };
}
export function moneyInputFieldV0(label = 'Valor', value = '') {
    const input = document.createElement('input');
    input.className = 'movement-field-control-v0 movement-money-input-v0';
    input.type = 'text';
    input.inputMode = 'decimal';
    input.placeholder = '0,00';
    input.value = value;
    input.setAttribute('aria-label', label);
    return {
        input,
        element: el('label', 'movement-field-v0', [el('span', 'movement-field-label-v0', [label]), input])
    };
}
