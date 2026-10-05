import { renderHomeV0 } from '../../presentation/home.js';
import { renderPatrimonyV1 } from '../../presentation/screens/patrimony-v1.js';
const ROUTES = new Set(['summary', 'patrimony']);
export async function renderSummaryRoute(state, repositories, rerender) {
    if (!ROUTES.has(state.route))
        return null;
    if (state.route === 'summary') {
        return renderHomeV0(repositories, state.profile, {
            onOpenMovements: () => { state.route = 'movements'; rerender(); },
            onOpenPatrimony: () => { state.route = 'patrimony'; rerender(); }
        });
    }
    return renderPatrimonyV1(repositories, state.profile);
}
