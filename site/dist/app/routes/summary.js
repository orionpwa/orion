import { IndexedDbEntityLifecycleMutationGateway } from '../../data/indexeddb/entity-lifecycle-mutations.js';
import { renderHomeV0 } from '../../presentation/home.js';
import { renderAssetDetailV1, renderAssetListV1, renderAssetValueV1, renderEditAssetV1, renderNewAssetV1, renderPatrimonyV1 } from '../../presentation/screens/patrimony-v1.js';
import { renderDocumentsListV1, renderNewPayslipV1, renderPayslipDetailV1 } from '../../presentation/screens/documents-v1.js';
import { renderDocumentsIrV1 } from '../../presentation/screens/documents-ir-v1.js';
import { renderFiscalV1, renderFiscalDossierV1 } from '../../presentation/screens/fiscal-v1.js';
const ROUTES = new Set([
    'summary',
    'fiscal',
    'fiscal-dossier',
    'patrimony',
    'patrimony-assets',
    'patrimony-asset-new',
    'patrimony-asset-detail',
    'patrimony-asset-edit',
    'patrimony-asset-value',
    'documents',
    'document-new',
    'document-detail',
    'documents-ir'
]);
const assetLifecycle = new IndexedDbEntityLifecycleMutationGateway();
export async function renderSummaryRoute(state, repositories, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if ((state.route === 'patrimony-asset-detail' || state.route === 'patrimony-asset-edit' || state.route === 'patrimony-asset-value') && !state.selectedAssetId)
        state.route = 'patrimony-assets';
    if (state.route === 'document-detail' && !state.selectedDocumentId)
        state.route = 'documents';
    const context = { repositories, profile: state.profile, lifecycle: assetLifecycle };
    if (state.route === 'summary') {
        return renderHomeV0(repositories, state.profile, {
            onOpenMovements: () => { state.route = 'movements'; rerender(); },
            onOpenPlanning: () => { state.route = 'planning'; rerender(); },
            onOpenAllocations: () => { state.route = 'planning-allocations'; rerender(); },
            onOpenDebts: () => { state.route = 'planning-debts'; rerender(); },
            onOpenPatrimony: () => { state.route = 'patrimony'; rerender(); }
        });
    }
    if (state.route === 'fiscal') {
        return renderFiscalV1(context, {
            onOpenDossier: () => { state.route = 'fiscal-dossier'; rerender(); },
            onOpenIr: () => { state.route = 'documents-ir'; rerender(); },
            onOpenDocuments: () => { state.route = 'documents'; rerender(); }
        });
    }
    if (state.route === 'fiscal-dossier')
        return renderFiscalDossierV1(context);
    if (state.route === 'documents-ir')
        return renderDocumentsIrV1(context);
    if (state.route === 'documents') {
        return renderDocumentsListV1(context, {
            onCreate: () => { state.route = 'document-new'; rerender(); },
            onOpen: (id) => { state.selectedDocumentId = id; state.route = 'document-detail'; rerender(); },
            onChanged: rerender
        });
    }
    if (state.route === 'document-new') {
        return renderNewPayslipV1(context, {
            onSaved: (id) => { state.selectedDocumentId = id; state.route = 'document-detail'; rerender(); }
        });
    }
    if (state.route === 'document-detail') {
        return renderPayslipDetailV1(context, state.selectedDocumentId, {
            onDeleted: () => { state.selectedDocumentId = null; state.route = 'documents'; rerender(); }
        });
    }
    if (state.route === 'patrimony') {
        return renderPatrimonyV1(repositories, state.profile, {
            onManageAssets: () => { state.route = 'patrimony-assets'; rerender(); }
        });
    }
    if (state.route === 'patrimony-assets') {
        return renderAssetListV1(context, {
            onCreate: () => { state.route = 'patrimony-asset-new'; rerender(); },
            onOpenDetail: (id) => { state.selectedAssetId = id; state.route = 'patrimony-asset-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-asset-new') {
        return renderNewAssetV1(context, {
            onSaved: (id) => { state.selectedAssetId = id; state.route = 'patrimony-asset-detail'; rerender(); }
        });
    }
    if (state.route === 'patrimony-asset-detail') {
        return renderAssetDetailV1(context, state.selectedAssetId, {
            onEdit: () => { state.route = 'patrimony-asset-edit'; rerender(); },
            onUpdateValue: () => { state.route = 'patrimony-asset-value'; rerender(); },
            onDeactivated: () => { state.selectedAssetId = null; state.route = 'patrimony-assets'; rerender(); }
        });
    }
    if (state.route === 'patrimony-asset-edit') {
        return renderEditAssetV1(context, state.selectedAssetId, {
            onSaved: () => { state.route = 'patrimony-asset-detail'; rerender(); }
        });
    }
    return renderAssetValueV1(context, state.selectedAssetId, {
        onCompleted: () => { state.route = 'patrimony-asset-detail'; rerender(); }
    });
}
