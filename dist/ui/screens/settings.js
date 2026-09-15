import { APP_VERSION } from '../../app/version.js';
import { updateProfileIdentity } from '../../application/profile/update-profile.js';
import { loadRuntimeConfig } from '../../config/runtime.js';
import { createProfileBackup } from '../../data/backup/profile.js';
import { serializeBackup } from '../../data/backup/model.js';
import { parseBackup } from '../../data/backup/validate.js';
import { rebindSingleProfileBackup } from '../../data/backup/rebind.js';
import { replaceProfileDataAtomically } from '../../data/backup/restore.js';
import { createFreshProfileData } from '../../data/backup/fresh-profile.js';
import { readJsonDocument } from '../../data/import/json-document.js';
import { applyPreparedLegacyMigration, prepareLegacyMigration } from '../../migration/legacy/apply.js';
import { createTechnicalReport, serializeTechnicalReport } from '../../diagnostics/technical-report.js';
import { el, button } from '../dom.js';
import { icon } from '../icons.js';
import { labeledField, textField } from '../components/fields.js';
import { showConfirmation } from '../components/sheets.js';
import { showToast } from '../components/feedback.js';
import { downloadTextFile } from '../download.js';
import { APPEARANCE_THEMES, loadAppearancePreferences, saveAppearancePreferences } from '../appearance.js';
function standaloneMode() {
    const nav = navigator;
    return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}
function disclosure(title, support, content, iconName = 'info') {
    return el('details', 'settings-disclosure', [
        el('summary', 'settings-disclosure-summary', [
            el('span', 'settings-action-symbol settings-action-symbol-static', [icon(iconName, 'settings-action-icon')]),
            el('span', 'settings-disclosure-copy', [el('strong', '', [title]), el('small', '', [support])]),
            el('span', 'settings-disclosure-chevron', [icon('chevron', 'settings-disclosure-chevron-icon')])
        ]),
        el('div', 'settings-disclosure-content', content)
    ]);
}
function settingsAction(iconName, title, support, onClick, tone = '') {
    const node = el('button', `settings-action ${tone}`.trim(), [
        el('span', 'settings-action-symbol', [icon(iconName, 'settings-action-icon')]),
        el('span', 'settings-action-copy', [el('strong', '', [title]), el('small', '', [support])]),
        el('span', 'settings-action-chevron', [icon('chevron', 'settings-action-chevron-icon')])
    ]);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
}
export async function renderSettings(repositories, profile, onProfileChanged, onDataChanged) {
    const runtimeConfig = await loadRuntimeConfig();
    const root = el('div', 'screen settings-screen', [
        el('div', 'screen-heading', [el('div', '', [
                el('h1', '', ['Configurações']),
                el('p', '', ['Seu perfil, seus dados e as opções essenciais do Orion.'])
            ])])
    ]);
    const nameInput = textField('Nome', profile.displayName);
    let savedDisplayName = profile.displayName.trim();
    const saveNameButton = button('btn primary full settings-save-name', 'Salvar nome', () => {
        void updateProfileIdentity(repositories.profiles, profile, { displayName: nameInput.value, completeOnboarding: true })
            .then((updated) => {
            savedDisplayName = updated.displayName.trim();
            saveNameButton.hidden = true;
            onProfileChanged(updated);
            showToast('Nome atualizado.', 'success');
        })
            .catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível atualizar seu nome.', 'error'));
    });
    saveNameButton.hidden = true;
    nameInput.addEventListener('input', () => {
        saveNameButton.hidden = nameInput.value.trim() === savedDisplayName;
    });
    const initial = profile.displayName.trim().charAt(0).toUpperCase() || 'O';
    const profileCard = el('section', 'settings-profile-card', [
        el('div', 'settings-profile-head', [
            el('span', 'settings-profile-avatar', [initial]),
            el('div', 'settings-profile-copy', [
                el('small', '', ['PERFIL']),
                el('strong', '', [profile.displayName]),
                el('span', '', ['Como o Orion chama você'])
            ])
        ]),
        labeledField('Nome exibido', nameInput),
        saveNameButton
    ]);
    let appearancePreferences = loadAppearancePreferences();
    const themeButtons = new Map();
    const intensityButtons = new Map();
    const themeGrid = el('div', 'appearance-theme-grid');
    const applyAppearancePreferences = (next) => {
        appearancePreferences = next;
        saveAppearancePreferences(next);
        for (const [theme, themeButton] of themeButtons) {
            themeButton.classList.toggle('active', !next.autoByTime && theme === next.theme);
            themeButton.setAttribute('aria-pressed', String(!next.autoByTime && theme === next.theme));
        }
        autoToggle.classList.toggle('active', next.autoByTime);
        autoToggle.setAttribute('aria-pressed', String(next.autoByTime));
        for (const [intensity, intensityButton] of intensityButtons) {
            intensityButton.classList.toggle('active', intensity === next.intensity);
            intensityButton.setAttribute('aria-pressed', String(intensity === next.intensity));
        }
    };
    for (const option of APPEARANCE_THEMES) {
        const themeButton = el('button', 'appearance-theme', [
            el('span', 'appearance-swatch'),
            el('span', '', [el('strong', '', [option.label]), el('small', '', [option.support])])
        ]);
        themeButton.type = 'button';
        themeButton.dataset.theme = option.id;
        themeButton.setAttribute('aria-label', `Usar aparência ${option.label}`);
        themeButton.addEventListener('click', () => applyAppearancePreferences({ ...appearancePreferences, theme: option.id, autoByTime: false }));
        themeButtons.set(option.id, themeButton);
        themeGrid.append(themeButton);
    }
    const autoToggle = el('button', 'appearance-toggle');
    autoToggle.type = 'button';
    autoToggle.setAttribute('aria-label', 'Trocar aparência automaticamente pelo horário');
    autoToggle.addEventListener('click', () => applyAppearancePreferences({ ...appearancePreferences, autoByTime: !appearancePreferences.autoByTime }));
    const intensityControl = el('div', 'appearance-intensity');
    const intensityOptions = [
        { id: 'soft', label: 'Suave' },
        { id: 'balanced', label: 'Equilibrado' },
        { id: 'vivid', label: 'Vivo' }
    ];
    for (const option of intensityOptions) {
        const intensityButton = el('button', '', [option.label]);
        intensityButton.type = 'button';
        intensityButton.addEventListener('click', () => applyAppearancePreferences({ ...appearancePreferences, intensity: option.id }));
        intensityButtons.set(option.id, intensityButton);
        intensityControl.append(intensityButton);
    }
    const appearanceCard = el('section', 'settings-section-card appearance-card', [
        el('div', 'settings-section-heading', [
            el('div', '', [el('small', '', ['APARÊNCIA']), el('h2', '', ['Seu Orion'])])
        ]),
        el('p', 'settings-help', ['Escolha a aparência do app. Isso não altera seus dados nem os cálculos financeiros.']),
        themeGrid,
        el('div', 'appearance-row', [
            el('div', 'appearance-row-copy', [
                el('strong', '', ['Mudar automaticamente pelo horário']),
                el('small', '', ['Aurora de manhã · Clássico durante o dia · Cobre ao entardecer · Violeta à noite'])
            ]),
            autoToggle
        ]),
        el('div', 'appearance-row', [
            el('div', 'appearance-row-copy', [el('strong', '', ['Intensidade visual']), el('small', '', ['Controla brilho e elementos decorativos.'])]),
            intensityControl
        ]),
        el('p', 'appearance-auto-note', ['A preferência fica somente neste dispositivo e pode ser alterada a qualquer momento. O ícone instalado do PWA permanece o mesmo.'])
    ]);
    applyAppearancePreferences(appearancePreferences);
    const exportButton = settingsAction('backup', 'Criar backup', 'Salve uma cópia dos seus dados neste dispositivo.', () => {
        void createProfileBackup(repositories, profile).then((backup) => {
            const day = new Date().toISOString().slice(0, 10);
            downloadTextFile(`orion-backup-${day}.json`, serializeBackup(backup));
            showToast('Backup criado.', 'success');
        }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível criar o backup.', 'error'));
    });
    const fileInput = el('input', 'visually-hidden');
    fileInput.type = 'file';
    fileInput.accept = '.json,.zip,application/json,application/zip';
    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file)
            return;
        void readJsonDocument(file).then((raw) => {
            const parsed = parseBackup(raw);
            const rebound = rebindSingleProfileBackup(parsed.data, profile);
            showConfirmation('Restaurar este backup?', 'Os dados atuais deste perfil serão substituídos pelos dados do arquivo selecionado.', 'Restaurar', () => {
                void replaceProfileDataAtomically(profile.id, rebound).then(() => {
                    const restoredProfile = rebound.profiles[0];
                    if (restoredProfile)
                        onProfileChanged(restoredProfile);
                    showToast('Backup restaurado.', 'success');
                    onDataChanged();
                }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível restaurar o backup.', 'error'));
            });
        }).catch((error) => showToast(error instanceof Error ? error.message : 'Esse arquivo não é um backup válido.', 'error'));
        fileInput.value = '';
    });
    const legacyInput = el('input', 'visually-hidden');
    legacyInput.type = 'file';
    legacyInput.accept = '.json,.zip,application/json,application/zip';
    legacyInput.addEventListener('change', () => {
        const file = legacyInput.files?.[0];
        if (!file)
            return;
        void readJsonDocument(file).then(async (raw) => {
            const prepared = await prepareLegacyMigration(raw, profile.id);
            const counts = prepared.report.counts;
            const summary = `${counts.accounts ?? 0} contas · ${counts.transactions ?? 0} movimentações · ${counts.debts ?? 0} dívidas.`;
            showConfirmation('Trazer dados do Orion anterior?', `Encontramos ${summary} Antes de importar, o Orion criará um backup da base atual.`, 'Importar dados', () => {
                void createProfileBackup(repositories, profile).then(async (currentBackup) => {
                    const stamp = new Date().toISOString().slice(0, 10);
                    downloadTextFile(`orion-antes-da-importacao-${stamp}.json`, serializeBackup(currentBackup));
                    await applyPreparedLegacyMigration(prepared, profile.id);
                    const migratedProfile = prepared.data.profiles[0];
                    if (migratedProfile)
                        onProfileChanged(migratedProfile);
                    onDataChanged();
                    showToast('Dados importados.', 'success');
                }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível importar os dados.', 'error'));
            });
        }).catch((error) => showToast(error instanceof Error ? error.message : 'Esse arquivo não é compatível.', 'error'));
        legacyInput.value = '';
    });
    const resetButton = settingsAction('refresh', 'Recomeçar com uma base nova', 'Cria um backup antes de limpar os dados deste perfil.', () => {
        showConfirmation('Recomeçar com uma base nova?', 'O Orion criará um backup antes de limpar os dados deste perfil. Depois, você fará o início novamente.', 'Criar backup e recomeçar', () => {
            resetButton.disabled = true;
            void createProfileBackup(repositories, profile).then(async (backup) => {
                const day = new Date().toISOString().slice(0, 10);
                downloadTextFile(`orion-antes-de-recomecar-${day}.json`, serializeBackup(backup));
                await replaceProfileDataAtomically(profile.id, createFreshProfileData(profile));
                window.location.reload();
            }).catch((error) => {
                resetButton.disabled = false;
                showToast(error instanceof Error ? error.message : 'Não foi possível preparar uma base nova.', 'error');
            });
        });
    }, 'settings-action-danger');
    const dataCard = el('section', 'settings-section-card', [
        el('div', 'settings-section-heading', [
            el('div', '', [el('small', '', ['DADOS']), el('h2', '', ['Backup e segurança'])]),
            el('span', 'settings-section-badge', ['LOCAL'])
        ]),
        el('div', 'settings-action-list', [
            exportButton,
            settingsAction('restore', 'Restaurar backup', 'Recupere uma cópia que você salvou anteriormente.', () => fileInput.click())
        ]),
        fileInput,
        legacyInput,
        disclosure('Outras opções de dados', 'Importação antiga e recomeço.', [
            settingsAction('restore', 'Trazer dados de outro Orion', 'Importe uma base antiga compatível.', () => legacyInput.click()),
            resetButton
        ], 'wallet')
    ]);
    const technicalReportButton = settingsAction('refresh', 'Verificar funcionamento', 'Confere se os dados locais estão acessíveis.', () => {
        technicalReportButton.disabled = true;
        void createTechnicalReport(runtimeConfig).then((report) => {
            const healthy = report.database.status === 'healthy';
            showToast(healthy ? 'Tudo certo com os dados locais.' : 'O armazenamento local precisa de atenção.', healthy ? 'success' : 'error');
        }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível verificar o dispositivo.', 'error')).finally(() => {
            technicalReportButton.disabled = false;
        });
    });
    const exportTechnicalReportButton = settingsAction('backup', 'Exportar relatório para suporte', 'Gera um arquivo técnico sem seus saldos ou movimentações.', () => {
        exportTechnicalReportButton.disabled = true;
        void createTechnicalReport(runtimeConfig).then((report) => {
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            downloadTextFile(`orion-suporte-${stamp}.json`, serializeTechnicalReport(report));
            showToast('Relatório para suporte criado.', 'success');
        }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível criar o relatório.', 'error')).finally(() => {
            exportTechnicalReportButton.disabled = false;
        });
    });
    const supportCard = el('section', 'settings-section-card settings-section-card-compact', [
        disclosure('Sobre o Orion', 'Versão, instalação e suporte.', [
            el('div', 'settings-simple-info', [
                el('div', '', [el('span', '', ['Versão']), el('strong', '', [APP_VERSION])]),
                el('div', '', [el('span', '', ['Dados']), el('strong', '', ['Neste dispositivo'])]),
                el('div', '', [el('span', '', ['Instalação']), el('strong', '', [standaloneMode() ? 'App instalado' : 'Navegador'])])
            ]),
            standaloneMode()
                ? el('p', 'settings-help', ['O Orion está instalado neste dispositivo.'])
                : el('p', 'settings-help', ['No iPhone: Safari → Compartilhar → Adicionar à Tela de Início.']),
            el('div', 'settings-action-list', [technicalReportButton, exportTechnicalReportButton])
        ], 'info')
    ]);
    root.append(profileCard, appearanceCard, dataCard, supportCard);
    return root;
}
