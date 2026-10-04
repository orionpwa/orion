import { APP_VERSION } from '../../../app/version.js';
import { loadRuntimeConfig } from '../../../config/runtime.js';
import { createTechnicalReport, serializeTechnicalReport } from '../../../diagnostics/technical-report.js';
import { el } from '../../dom.js';
import { downloadTextFile } from '../../download.js';
import { showToast } from '../../components/feedback.js';
import { settingsActionV0, settingsInfoBlockV0 } from './shared.js';
function standaloneMode() {
    const nav = navigator;
    return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}
export function renderSettingsAboutV0() {
    const diagnostics = el('div', 'settings-list-v0');
    const check = settingsActionV0('Verificar funcionamento', 'Confere se os dados locais estão acessíveis', () => {
        check.disabled = true;
        void loadRuntimeConfig().then((config) => createTechnicalReport(config)).then((report) => {
            const healthy = report.database.status === 'healthy';
            showToast(healthy ? 'Tudo certo com os dados locais.' : 'O armazenamento local precisa de atenção.', healthy ? 'success' : 'error');
        }).catch((failure) => showToast(failure instanceof Error ? failure.message : 'Não foi possível verificar o dispositivo.', 'error'))
            .finally(() => { check.disabled = false; });
    });
    const exportReport = settingsActionV0('Exportar relatório para suporte', 'Gera um arquivo técnico sem seus saldos ou movimentações', () => {
        exportReport.disabled = true;
        void loadRuntimeConfig().then((config) => createTechnicalReport(config)).then((report) => {
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            downloadTextFile(`orion-suporte-${stamp}.json`, serializeTechnicalReport(report));
            showToast('Relatório para suporte criado.', 'success');
        }).catch((failure) => showToast(failure instanceof Error ? failure.message : 'Não foi possível criar o relatório.', 'error'))
            .finally(() => { exportReport.disabled = false; });
    });
    diagnostics.append(check, exportReport);
    const installed = standaloneMode();
    return el('div', 'settings-screen-v0 settings-internal-v0', [
        el('div', 'settings-info-list-v0', [
            settingsInfoBlockV0('Versão', APP_VERSION),
            settingsInfoBlockV0('Dados', 'Neste dispositivo'),
            settingsInfoBlockV0('Instalação', installed ? 'App instalado' : 'Navegador', installed ? 'O Orion está instalado neste dispositivo.' : 'No iPhone: Safari → Compartilhar → Adicionar à Tela de Início.')
        ]),
        el('section', 'settings-support-v0', [el('h2', '', ['Suporte e diagnóstico']), diagnostics])
    ]);
}
