import { deactivateEntity, undoEntityMutation } from '../../application/lifecycle/deactivate-entity.js';
import { showActionToast, showToast } from './feedback.js';
export function deactivateWithUndoFeedback(gateway, profileId, entityType, entityId, label, onChanged) {
    void deactivateEntity(gateway, profileId, entityType, entityId)
        .then((event) => {
        onChanged();
        showActionToast(`${label} desativado.`, 'Desfazer', () => {
            void undoEntityMutation(gateway, profileId, event.id)
                .then(() => {
                showToast(`${label} restaurado.`, 'success');
                onChanged();
            })
                .catch((error) => showToast(error instanceof Error ? error.message : `Não foi possível restaurar ${label.toLowerCase()}.`, 'error'));
        });
    })
        .catch((error) => showToast(error instanceof Error ? error.message : `Não foi possível desativar ${label.toLowerCase()}.`, 'error'));
}
