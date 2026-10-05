import { DEFAULT_MOVEMENT_FILTERS_V0 } from '../../presentation/movements.js';
import { renderAccountsRootV0, renderAccountDetailV0, renderNewAccountV0, renderEditAccountV0, renderNewCardV1, renderCardDetailV1, renderEditCardV1, renderCardPaymentV1 } from '../../presentation/accounts.js';
const ROUTES = new Set(['accounts', 'account-new', 'account-detail', 'account-edit', 'card-new', 'card-detail', 'card-edit', 'card-payment']);
export async function renderAccountRoute(state, repositories, lifecycle, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if ((state.route === 'account-detail' || state.route === 'account-edit') && !state.selectedAccountId)
        state.route = 'accounts';
    if ((state.route === 'card-detail' || state.route === 'card-edit' || state.route === 'card-payment') && !state.selectedCardId)
        state.route = 'accounts';
    const context = { repositories, profile: state.profile, lifecycle };
    if (state.route === 'accounts') {
        return renderAccountsRootV0(context, {
            onCreate: () => { state.route = 'account-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedAccountId = id; state.route = 'account-detail'; rerender(); },
            onCreateCard: () => { state.route = 'card-new'; rerender(); },
            onOpenCardDetail: (id) => { state.selectedCardId = id; state.route = 'card-detail'; rerender(); }
        });
    }
    if (state.route === 'account-new') {
        return renderNewAccountV0(context, {
            onSaved: (id) => { state.selectedAccountId = id; state.route = 'account-detail'; rerender(); }
        });
    }
    if (state.route === 'account-detail') {
        return renderAccountDetailV0(context, state.selectedAccountId, {
            onEdit: () => { state.route = 'account-edit'; rerender(); },
            onDeactivated: () => { state.selectedAccountId = null; state.route = 'accounts'; rerender(); },
            onOpenMovement: (id) => { state.selectedMovementId = id; state.route = 'movement-detail'; rerender(); },
            onViewAllMovements: () => {
                state.movementFilters = { ...DEFAULT_MOVEMENT_FILTERS_V0, accountId: state.selectedAccountId };
                state.route = 'movements';
                rerender();
            }
        });
    }
    if (state.route === 'account-edit') {
        return renderEditAccountV0(context, state.selectedAccountId, {
            onSaved: () => { state.route = 'account-detail'; rerender(); }
        });
    }
    if (state.route === 'card-new') {
        return renderNewCardV1(context, {
            onSaved: (id) => { state.selectedCardId = id; state.route = 'card-detail'; rerender(); }
        });
    }
    if (state.route === 'card-detail') {
        return renderCardDetailV1(context, state.selectedCardId, {
            onEdit: () => { state.route = 'card-edit'; rerender(); },
            onPayment: () => { state.route = 'card-payment'; rerender(); },
            onDeactivated: () => { state.selectedCardId = null; state.route = 'accounts'; rerender(); }
        });
    }
    if (state.route === 'card-edit') {
        return renderEditCardV1(context, state.selectedCardId, {
            onSaved: () => { state.route = 'card-detail'; rerender(); }
        });
    }
    return renderCardPaymentV1(context, state.selectedCardId, {
        onCompleted: () => { state.route = 'card-detail'; rerender(); }
    });
}
