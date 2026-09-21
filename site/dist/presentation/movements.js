import { renderMovements } from './screens/movements.js';
export async function renderMovementsV3(repositories, profile, mutations, onChanged) {
    const root = await renderMovements(repositories, profile, mutations, onChanged);
    root.classList.remove('screen');
    root.classList.add('screen-v3', 'movements-screen-v3');
    root.querySelector('.screen-heading')?.remove();
    return root;
}
