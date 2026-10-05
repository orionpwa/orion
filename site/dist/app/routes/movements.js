import { DEFAULT_MOVEMENT_FILTERS_V0, renderMovementDetailV0, renderMovementFiltersV0, renderMovementListV0, renderNewMovementV0, renderEditMovementV0 } from '../../presentation/movements.js';
const ROUTES = new Set(['movements', 'movement-new', 'movement-detail', 'movement-edit', 'movement-filters']);
export async function renderMovementRoute(state, repositories, transactionMutations, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if ((state.route === 'movement-detail' || state.route === 'movement-edit') && !state.selectedMovementId) {
        state.route = 'movements';
    }
    if (state.route === 'movements') {
        return renderMovementListV0(repositories, state.profile, state.movementFilters, {
            onOpenDetail: (transactionId) => {
                state.selectedMovementId = transactionId;
                state.route = 'movement-detail';
                rerender();
            },
            onOpenFilters: () => { state.route = 'movement-filters'; rerender(); },
            onClearFilters: () => { state.movementFilters = { ...DEFAULT_MOVEMENT_FILTERS_V0 }; rerender(); }
        });
    }
    if (state.route === 'movement-new') {
        return renderNewMovementV0(repositories, state.profile, {
            onSaved: (transaction) => {
                state.selectedMovementId = transaction.id;
                state.route = 'movement-detail';
                rerender();
            }
        });
    }
    if (state.route === 'movement-detail') {
        return renderMovementDetailV0(repositories, state.profile, transactionMutations, state.selectedMovementId, {
            onEdit: () => { state.route = 'movement-edit'; rerender(); },
            onDeleted: () => { state.selectedMovementId = null; state.route = 'movements'; rerender(); },
            onRestored: rerender
        });
    }
    if (state.route === 'movement-edit') {
        return renderEditMovementV0(repositories, state.profile, transactionMutations, state.selectedMovementId, {
            onSaved: () => { state.route = 'movement-detail'; rerender(); },
            onUnavailable: () => {
                setTimeout(() => {
                    state.selectedMovementId = null;
                    state.route = 'movements';
                    rerender();
                }, 0);
            }
        });
    }
    return renderMovementFiltersV0(repositories, state.profile, state.movementFilters, {
        onApply: (next) => { state.movementFilters = next; state.route = 'movements'; rerender(); }
    });
}
