import { renderPlanningRootV0, renderCommitmentListV0, renderCommitmentDetailV0, renderNewCommitmentV0, renderEditCommitmentV0, renderCommitmentPaymentV0, renderDebtListV0, renderDebtDetailV0, renderNewDebtV0, renderEditDebtV0, renderDebtPaymentV0, renderAllocationListV0, renderAllocationDetailV0, renderNewAllocationV0, renderEditAllocationV0, renderAdjustAllocationV0 } from '../../presentation/planning.js';
const ROUTES = new Set([
    'planning', 'planning-commitments', 'planning-commitment-new', 'planning-commitment-detail', 'planning-commitment-edit', 'planning-commitment-payment',
    'planning-debts', 'planning-debt-new', 'planning-debt-detail', 'planning-debt-edit', 'planning-debt-payment',
    'planning-allocations', 'planning-allocation-new', 'planning-allocation-detail', 'planning-allocation-edit', 'planning-allocation-adjust'
]);
export async function renderPlanningRoute(state, repositories, lifecycle, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if ((state.route === 'planning-commitment-detail' || state.route === 'planning-commitment-edit' || state.route === 'planning-commitment-payment') && !state.selectedCommitmentId)
        state.route = 'planning-commitments';
    if ((state.route === 'planning-debt-detail' || state.route === 'planning-debt-edit' || state.route === 'planning-debt-payment') && !state.selectedDebtId)
        state.route = 'planning-debts';
    if ((state.route === 'planning-allocation-detail' || state.route === 'planning-allocation-edit' || state.route === 'planning-allocation-adjust') && !state.selectedAllocationId)
        state.route = 'planning-allocations';
    const context = { repositories, profile: state.profile, lifecycle };
    if (state.route === 'planning') {
        return renderPlanningRootV0(context, {
            onOpenCommitments: () => { state.route = 'planning-commitments'; rerender(); },
            onOpenDebts: () => { state.route = 'planning-debts'; rerender(); },
            onOpenAllocations: () => { state.route = 'planning-allocations'; rerender(); }
        });
    }
    if (state.route === 'planning-commitments') {
        return renderCommitmentListV0(context, {
            onCreate: () => { state.route = 'planning-commitment-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedCommitmentId = id; state.route = 'planning-commitment-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-commitment-new') {
        return renderNewCommitmentV0(context, {
            onSaved: (id) => { state.selectedCommitmentId = id; state.route = 'planning-commitment-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-commitment-detail') {
        return renderCommitmentDetailV0(context, state.selectedCommitmentId, {
            onEdit: () => { state.route = 'planning-commitment-edit'; rerender(); },
            onPayment: () => { state.route = 'planning-commitment-payment'; rerender(); },
            onChanged: rerender,
            onDeactivated: () => { state.selectedCommitmentId = null; state.route = 'planning-commitments'; rerender(); }
        });
    }
    if (state.route === 'planning-commitment-edit') {
        return renderEditCommitmentV0(context, state.selectedCommitmentId, {
            onSaved: () => { state.route = 'planning-commitment-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-commitment-payment') {
        return renderCommitmentPaymentV0(context, state.selectedCommitmentId, {
            onCompleted: () => { state.route = 'planning-commitment-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-debts') {
        return renderDebtListV0(context, {
            onCreate: () => { state.route = 'planning-debt-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedDebtId = id; state.route = 'planning-debt-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-debt-new') {
        return renderNewDebtV0(context, {
            onSaved: (id) => { state.selectedDebtId = id; state.route = 'planning-debt-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-debt-detail') {
        return renderDebtDetailV0(context, state.selectedDebtId, {
            onEdit: () => { state.route = 'planning-debt-edit'; rerender(); },
            onPayment: () => { state.route = 'planning-debt-payment'; rerender(); },
            onDeactivated: () => { state.selectedDebtId = null; state.route = 'planning-debts'; rerender(); }
        });
    }
    if (state.route === 'planning-debt-edit') {
        return renderEditDebtV0(context, state.selectedDebtId, {
            onSaved: () => { state.route = 'planning-debt-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-debt-payment') {
        return renderDebtPaymentV0(context, state.selectedDebtId, {
            onCompleted: () => { state.route = 'planning-debt-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-allocations') {
        return renderAllocationListV0(context, {
            onCreate: () => { state.route = 'planning-allocation-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedAllocationId = id; state.route = 'planning-allocation-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-allocation-new') {
        return renderNewAllocationV0(context, {
            onSaved: (id) => { state.selectedAllocationId = id; state.route = 'planning-allocation-detail'; rerender(); }
        });
    }
    if (state.route === 'planning-allocation-detail') {
        return renderAllocationDetailV0(context, state.selectedAllocationId, {
            onEdit: () => { state.route = 'planning-allocation-edit'; rerender(); },
            onAdjust: () => { state.route = 'planning-allocation-adjust'; rerender(); },
            onDeactivated: () => { state.selectedAllocationId = null; state.route = 'planning-allocations'; rerender(); }
        });
    }
    if (state.route === 'planning-allocation-edit') {
        return renderEditAllocationV0(context, state.selectedAllocationId, {
            onSaved: () => { state.route = 'planning-allocation-detail'; rerender(); }
        });
    }
    return renderAdjustAllocationV0(context, state.selectedAllocationId, {
        onCompleted: () => { state.route = 'planning-allocation-detail'; rerender(); }
    });
}
