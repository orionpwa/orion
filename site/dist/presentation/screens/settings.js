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
import { showConfirmation, showSheet } from '../components/sheets.js';
import { showToast } from '../components/feedback.js';
import { downloadTextFile } from '../download.js';
import { APPEARANCE_THEMES, loadAppearancePreferences, saveAppearancePreferences } from '../appearance.js';
function standaloneMode() {
    const nav = navigator;
    return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}
function settingRow(iconName, title, support, value, onClick) {
    const node = el('button', 'settings-menu-row', [
        el('span', 'settings-menu-icon', [icon(iconName, 'settings-menu-icon-svg')]),
        el('span', 'settings-menu-copy', [el('strong', '', [title]), el('small', '', [support])]),
        el('span', 'settings-menu-value', [value]),
        icon('chevron', 'settings-menu-chevron')
    ]);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
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
function themeLabel(preferences) {
    if (preferences.autoByTime)
        return 'Automático';
    return APPEARANCE_THEMES.find((item) => item.id === preferences.theme)?.label ?? 'Orion';
}
function intensityLabel(value) {
    return value === 'soft' ? 'Suave' : value === 'immersive' ? 'Imersiva' : 'Equilibrada';
}
export async function renderSettings(repositories, profile, onProfileChanged, onDataChanged) {
    const runtimeConfig = await loadRuntimeConfig();
    let appearancePreferences = loadAppearancePreferences();
    let currentProfile = profile;
    const root = el('div', 'screen settings-screen', [
        el('div', 'screen-heading', [el('div', '', [
                el('h1', '', ['Configurações']),
                el('p', '', ['Seu perfil, sua aparência e seus dados em um só lugar.'])
            ])])
    ]);
    const fileInput = el('input', 'visually-hidden');
    fileInput.type = 'file';
    fileInput.accept = '.json,.zip,application/json,application/zip';
    const legacyInput = el('input', 'visually-hidden');
    legacyInput.type = 'file';
    legacyInput.accept = '.json,.zip,application/json,application/zip';
    const initial = currentProfile.displayName.trim().charAt(0).toUpperCase() || 'O';
    const profileHeroName = el('strong', '', [currentProfile.displayName]);
    const profileHero = el('section', 'settings-account-card', [
        el('span', 'settings-account-avatar', [initial]),
        el('div', 'settings-account-copy', [profileHeroName, el('span', '', ['Perfil local do Orion'])])
    ]);
    const appearanceValue = el('span', 'settings-menu-value', [`${themeLabel(appearancePreferences)} · ${intensityLabel(appearancePreferences.intensity)}`]);
    const openProfile = () => {
        const nameInput = textField('Nome', currentProfile.displayName);
        const form = el('form', 'form-stack', [labeledField('Nome exibido', nameInput)]);
        const save = button('btn primary full-width', 'Salvar', () => undefined);
        save.type = 'submit';
        form.append(save);
        const close = showSheet('Perfil', form);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            save.disabled = true;
            void updateProfileIdentity(repositories.profiles, currentProfile, { displayName: nameInput.value, completeOnboarding: true }).then((updated) => {
                currentProfile = updated;
                profileHeroName.textContent = updated.displayName;
                const avatar = profileHero.querySelector('.settings-account-avatar');
                if (avatar)
                    avatar.textContent = updated.displayName.trim().charAt(0).toUpperCase() || 'O';
                onProfileChanged(updated);
                close();
                showToast('Perfil atualizado.', 'success');
            }).catch((error) => { save.disabled = false; showToast(error instanceof Error ? error.message : 'Não foi possível atualizar seu perfil.', 'error'); });
        });
    };
    const applyAppearancePreferences = (next) => {
        appearancePreferences = next;
        saveAppearancePreferences(next);
        appearanceValue.textContent = `${themeLabel(next)} · ${intensityLabel(next.intensity)}`;
    };
    const openThemePicker = () => {
        const grid = el('div', 'appearance-picker-grid');
        const refresh = () => {
            grid.replaceChildren();
            for (const option of APPEARANCE_THEMES) {
                const active = !appearancePreferences.autoByTime && appearancePreferences.theme === option.id;
                const swatches = el('span', 'appearance-preview-colors', option.palette.map((color) => { const sw = el('i', ''); sw.style.background = color; return sw; }));
                const item = el('button', `appearance-picker-item${active ? ' active' : ''}`, [swatches, el('span', '', [el('strong', '', [option.label]), el('small', '', [option.support])]), active ? icon('check', 'appearance-picker-check') : el('span', 'appearance-picker-check')]);
                item.type = 'button';
                item.addEventListener('click', () => { applyAppearancePreferences({ ...appearancePreferences, theme: option.id, autoByTime: false }); refresh(); });
                grid.append(item);
            }
        };
        refresh();
        showSheet('Escolher tema', grid);
    };
    const openAppearance = () => {
        const body = el('div', 'appearance-settings-sheet');
        const themeCurrent = el('strong', '', [themeLabel(appearancePreferences)]);
        const themeRow = el('button', 'settings-inline-row', [el('span', '', [el('small', '', ['TEMA ATUAL']), themeCurrent]), icon('chevron', 'settings-menu-chevron')]);
        themeRow.type = 'button';
        themeRow.addEventListener('click', openThemePicker);
        const autoToggle = el('button', 'settings-switch');
        autoToggle.type = 'button';
        const effectsToggle = el('button', 'settings-switch');
        effectsToggle.type = 'button';
        const intensity = el('div', 'appearance-intensity');
        const buttons = new Map();
        const refresh = () => {
            themeCurrent.textContent = themeLabel(appearancePreferences);
            autoToggle.classList.toggle('active', appearancePreferences.autoByTime);
            autoToggle.setAttribute('aria-pressed', String(appearancePreferences.autoByTime));
            effectsToggle.classList.toggle('active', appearancePreferences.reduceEffects);
            effectsToggle.setAttribute('aria-pressed', String(appearancePreferences.reduceEffects));
            for (const [id, node] of buttons) {
                node.classList.toggle('active', appearancePreferences.intensity === id);
                node.setAttribute('aria-pressed', String(appearancePreferences.intensity === id));
            }
        };
        autoToggle.addEventListener('click', () => { applyAppearancePreferences({ ...appearancePreferences, autoByTime: !appearancePreferences.autoByTime }); refresh(); });
        effectsToggle.addEventListener('click', () => { applyAppearancePreferences({ ...appearancePreferences, reduceEffects: !appearancePreferences.reduceEffects }); refresh(); });
        for (const option of [{ id: 'soft', label: 'Suave' }, { id: 'balanced', label: 'Equilibrada' }, { id: 'immersive', label: 'Imersiva' }]) {
            const node = el('button', '', [option.label]);
            node.type = 'button';
            node.addEventListener('click', () => { applyAppearancePreferences({ ...appearancePreferences, intensity: option.id }); refresh(); });
            buttons.set(option.id, node);
            intensity.append(node);
        }
        body.append(themeRow, el('div', 'settings-inline-row', [el('span', '', [el('strong', '', ['Mudar pelo horário']), el('small', '', ['A aparência acompanha o período do dia.'])]), autoToggle]), el('div', 'settings-inline-stack', [el('span', '', [el('strong', '', ['Intensidade visual']), el('small', '', ['Ajusta brilho e profundidade sem mudar o layout.'])]), intensity]), el('div', 'settings-inline-row', [el('span', '', [el('strong', '', ['Reduzir efeitos']), el('small', '', ['Diminui brilhos e animações decorativas.'])]), effectsToggle]), el('p', 'settings-sheet-note', ['O ícone instalado do PWA permanece Rubi. A marca dentro do Orion acompanha o tema escolhido.']));
        refresh();
        showSheet('Aparência', body);
    };
    const exportButton = settingsAction('backup', 'Criar backup', 'Salve uma cópia dos seus dados neste dispositivo.', () => {
        void createProfileBackup(repositories, currentProfile).then((backup) => { const day = new Date().toISOString().slice(0, 10); downloadTextFile(`orion-backup-${day}.json`, serializeBackup(backup)); showToast('Backup criado.', 'success'); }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível criar o backup.', 'error'));
    });
    fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (!file)
        return; void readJsonDocument(file).then((raw) => { const parsed = parseBackup(raw); const rebound = rebindSingleProfileBackup(parsed.data, currentProfile); showConfirmation('Restaurar este backup?', 'Os dados atuais deste perfil serão substituídos pelos dados do arquivo selecionado.', 'Restaurar', () => { void replaceProfileDataAtomically(currentProfile.id, rebound).then(() => { const restored = rebound.profiles[0]; if (restored) {
        currentProfile = restored;
        onProfileChanged(restored);
    } showToast('Backup restaurado.', 'success'); onDataChanged(); }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível restaurar o backup.', 'error')); }); }).catch((error) => showToast(error instanceof Error ? error.message : 'Esse arquivo não é um backup válido.', 'error')); fileInput.value = ''; });
    legacyInput.addEventListener('change', () => { const file = legacyInput.files?.[0]; if (!file)
        return; void readJsonDocument(file).then(async (raw) => { const prepared = await prepareLegacyMigration(raw, currentProfile.id); const counts = prepared.report.counts; const summary = `${counts.accounts ?? 0} contas · ${counts.transactions ?? 0} movimentações · ${counts.debts ?? 0} dívidas.`; showConfirmation('Trazer dados do Orion anterior?', `Encontramos ${summary} Antes de importar, o Orion criará um backup da base atual.`, 'Importar dados', () => { void createProfileBackup(repositories, currentProfile).then(async (currentBackup) => { const stamp = new Date().toISOString().slice(0, 10); downloadTextFile(`orion-antes-da-importacao-${stamp}.json`, serializeBackup(currentBackup)); await applyPreparedLegacyMigration(prepared, currentProfile.id); const migrated = prepared.data.profiles[0]; if (migrated) {
        currentProfile = migrated;
        onProfileChanged(migrated);
    } onDataChanged(); showToast('Dados importados.', 'success'); }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível importar os dados.', 'error')); }); }).catch((error) => showToast(error instanceof Error ? error.message : 'Esse arquivo não é compatível.', 'error')); legacyInput.value = ''; });
    const resetButton = settingsAction('refresh', 'Recomeçar com uma base nova', 'Cria um backup antes de limpar os dados deste perfil.', () => { showConfirmation('Recomeçar com uma base nova?', 'O Orion criará um backup antes de limpar os dados deste perfil. Depois, você fará o início novamente.', 'Criar backup e recomeçar', () => { resetButton.disabled = true; void createProfileBackup(repositories, currentProfile).then(async (backup) => { const day = new Date().toISOString().slice(0, 10); downloadTextFile(`orion-antes-de-recomecar-${day}.json`, serializeBackup(backup)); await replaceProfileDataAtomically(currentProfile.id, createFreshProfileData(currentProfile)); window.location.reload(); }).catch((error) => { resetButton.disabled = false; showToast(error instanceof Error ? error.message : 'Não foi possível preparar uma base nova.', 'error'); }); }); }, 'settings-action-danger');
    const openDataSecurity = () => {
        const body = el('div', 'settings-sheet-list', [exportButton, settingsAction('restore', 'Restaurar backup', 'Recupere uma cópia salva anteriormente.', () => fileInput.click()), el('div', 'settings-sheet-divider'), settingsAction('restore', 'Trazer dados de outro Orion', 'Importe uma base antiga compatível.', () => legacyInput.click()), resetButton]);
        showSheet('Dados e segurança', body);
    };
    const openPrivacy = () => {
        showSheet('Privacidade', el('div', 'privacy-sheet', [el('div', 'privacy-hero', [icon('shield', 'privacy-hero-icon'), el('div', '', [el('strong', '', ['Seus dados ficam com você']), el('span', '', ['Nesta versão, o Orion funciona localmente neste dispositivo.'])])]), el('div', 'privacy-item', [el('strong', '', ['Dados financeiros']), el('span', '', ['Contas, movimentações, dívidas e metas ficam no armazenamento local do app.'])]), el('div', 'privacy-item', [el('strong', '', ['Backup']), el('span', '', ['O arquivo só é criado quando você solicita e fica sob seu controle.'])]), el('div', 'privacy-item', [el('strong', '', ['Serviços externos']), el('span', '', ['Nenhum login ou sincronização em nuvem está ativo nesta versão.'])])]));
    };
    const technicalReportButton = settingsAction('refresh', 'Verificar funcionamento', 'Confere se os dados locais estão acessíveis.', () => { technicalReportButton.disabled = true; void createTechnicalReport(runtimeConfig).then((report) => { const healthy = report.database.status === 'healthy'; showToast(healthy ? 'Tudo certo com os dados locais.' : 'O armazenamento local precisa de atenção.', healthy ? 'success' : 'error'); }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível verificar o dispositivo.', 'error')).finally(() => { technicalReportButton.disabled = false; }); });
    const exportTechnicalReportButton = settingsAction('backup', 'Exportar relatório para suporte', 'Gera um arquivo técnico sem seus saldos ou movimentações.', () => { exportTechnicalReportButton.disabled = true; void createTechnicalReport(runtimeConfig).then((report) => { const stamp = new Date().toISOString().replace(/[:.]/g, '-'); downloadTextFile(`orion-suporte-${stamp}.json`, serializeTechnicalReport(report)); showToast('Relatório para suporte criado.', 'success'); }).catch((error) => showToast(error instanceof Error ? error.message : 'Não foi possível criar o relatório.', 'error')).finally(() => { exportTechnicalReportButton.disabled = false; }); });
    const openAbout = () => {
        showSheet('Sobre o Orion', el('div', 'about-sheet', [el('div', 'settings-simple-info', [el('div', '', [el('span', '', ['Versão']), el('strong', '', [APP_VERSION])]), el('div', '', [el('span', '', ['Dados']), el('strong', '', ['Neste dispositivo'])]), el('div', '', [el('span', '', ['Instalação']), el('strong', '', [standaloneMode() ? 'App instalado' : 'Navegador'])])]), standaloneMode() ? el('p', 'settings-sheet-note', ['O Orion está instalado neste dispositivo.']) : el('p', 'settings-sheet-note', ['No iPhone: Safari → Compartilhar → Adicionar à Tela de Início.']), el('details', 'support-disclosure', [el('summary', '', [el('span', '', ['Suporte e diagnóstico']), icon('chevron', 'settings-menu-chevron')]), el('div', 'settings-sheet-list', [technicalReportButton, exportTechnicalReportButton])])]));
    };
    const group = (label, rows) => el('section', 'settings-menu-group', [el('small', 'settings-menu-group-label', [label]), el('div', 'settings-menu-card', rows)]);
    const profileRow = settingRow('user', 'Perfil', 'Nome e preferências pessoais', currentProfile.displayName, openProfile);
    const appearanceRow = settingRow('palette', 'Aparência', 'Tema, intensidade e comportamento visual', '', openAppearance);
    appearanceRow.querySelector('.settings-menu-value')?.replaceWith(appearanceValue);
    const dataRow = settingRow('backup', 'Dados e segurança', 'Backup, restauração e importação', '', openDataSecurity);
    const privacyRow = settingRow('shield', 'Privacidade', 'Como seus dados são armazenados', 'Local', openPrivacy);
    const aboutRow = settingRow('info', 'Sobre o Orion', 'Versão, instalação e suporte', APP_VERSION.replace('0.1.0-development.', '12.'), openAbout);
    root.append(profileHero, group('PESSOAL', [profileRow, appearanceRow]), group('DADOS', [dataRow, privacyRow]), group('ORION', [aboutRow]), fileInput, legacyInput);
    return root;
}
