export const MARKET_DATA_DISCLOSURE = {
    service: 'Orion Market Gateway',
    enabled: false,
    purpose: 'Reservado para eventual atualização patrimonial futura; desativado na versão pessoal 0.1.0.',
    fieldsSentWhenEnabled: ['symbol', 'venue', 'currency'],
    fieldsNeverSent: ['profileId', 'displayName', 'saldo', 'quantidade', 'preço médio', 'movimentações', 'dívidas', 'documentos']
};
export const DEFAULT_PRIVACY_SUMMARY = {
    storage: 'Dados financeiros e documentos permanecem no armazenamento local do aparelho.',
    telemetry: 'O Orion não possui analytics ou telemetria de comportamento.',
    marketData: 'A consulta automática de mercado está desativada na versão pessoal 0.1.0.',
    ai: 'O Orion não envia saldos, movimentações ou documentos financeiros para serviços de IA.',
    cloud: 'Não há login nem sincronização dos dados financeiros com uma nuvem do Orion.'
};
