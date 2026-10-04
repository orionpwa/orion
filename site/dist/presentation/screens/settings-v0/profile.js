import { updateProfileIdentity } from '../../../application/profile/update-profile.js';
import { el } from '../../dom.js';
import { showToast } from '../../components/feedback.js';
import { settingsErrorV0 } from './shared.js';
export function renderSettingsProfileV0(context, onSaved) {
    const input = document.createElement('input');
    input.className = 'settings-field-control-v0';
    input.type = 'text';
    input.value = context.profile.displayName;
    input.autocomplete = 'name';
    input.setAttribute('aria-label', 'Nome exibido');
    const error = settingsErrorV0();
    const save = el('button', 'settings-primary-action-v0', ['Salvar alterações']);
    save.type = 'submit';
    const form = el('form', 'settings-form-v0', [
        el('label', 'settings-field-v0', [el('span', 'settings-field-label-v0', ['Nome exibido']), input]),
        error.element,
        save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        void updateProfileIdentity(context.repositories.profiles, context.profile, {
            displayName: input.value,
            completeOnboarding: true
        }).then((updated) => {
            context.onProfileChanged(updated);
            showToast('Perfil atualizado.', 'success');
            onSaved();
        }).catch((failure) => {
            save.disabled = false;
            error.show(failure instanceof Error ? failure.message : 'Não foi possível atualizar seu perfil.');
        });
    });
    return el('div', 'settings-screen-v0 settings-internal-v0', [
        el('p', 'settings-intro-v0', ['Este nome aparece apenas no seu perfil local do Orion.']),
        form
    ]);
}
