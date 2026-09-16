import { getInstitution } from '../../catalog/institutions.js';
import { el } from '../dom.js';
export function institutionBrand(institutionId, fallbackName, className = 'institution-brand-v2') {
    const institution = getInstitution(institutionId);
    const wrapper = el('span', className);
    wrapper.style.setProperty('--institution-color', institution?.color ?? '#58708f');
    if (institutionId) {
        const img = el('img');
        img.alt = institution?.name ?? fallbackName;
        img.loading = 'eager';
        img.decoding = 'async';
        img.src = `./assets/institutions-v2/${institutionId}.svg`;
        img.addEventListener('error', () => {
            img.remove();
            wrapper.textContent = institution?.shortName ?? fallbackName.slice(0, 2).toUpperCase();
        }, { once: true });
        wrapper.append(img);
    }
    else {
        wrapper.textContent = fallbackName.slice(0, 2).toUpperCase();
    }
    return wrapper;
}
