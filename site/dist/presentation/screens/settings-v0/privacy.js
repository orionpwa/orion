import { el } from '../../dom.js';
import { settingsInfoBlockV0 } from './shared.js';
export function renderSettingsPrivacyV0() {
    return el('div', 'settings-screen-v0 settings-internal-v0', [
        el('p', 'settings-intro-v0', ['O Orion foi fechado para uso pessoal local-first: seus dados financeiros permanecem neste dispositivo, salvo quando você cria um arquivo de backup.']),
        el('div', 'settings-info-list-v0', [
            settingsInfoBlockV0('Dados financeiros', 'Neste dispositivo', 'Contas, movimentações, cartões, dívidas, metas e reservas ficam no armazenamento local do app.'),
            settingsInfoBlockV0('Documentos', 'Leitura local', 'Holerites e informes são processados no navegador e arquivados localmente. O leitor de PDF pode baixar a biblioteca PDF.js na primeira utilização.'),
            settingsInfoBlockV0('IA e telemetria', 'Não utilizadas', 'O Orion não envia seus saldos, movimentações ou documentos para IA e não possui analytics de comportamento.'),
            settingsInfoBlockV0('Mercado', 'Desativado', 'A consulta automática de mercado está desligada nesta versão pessoal.'),
            settingsInfoBlockV0('Backup', 'Sob seu controle', 'Arquivos de backup só são criados quando você solicita e permanecem sob seu controle.'),
            settingsInfoBlockV0('Sincronização em nuvem', 'Desativada', 'Não há login nem sincronização dos seus dados financeiros com uma nuvem do Orion.')
        ])
    ]);
}
