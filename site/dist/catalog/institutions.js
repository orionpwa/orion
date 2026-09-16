const CATALOG = [
    { id: 'banco-do-brasil', name: 'Banco do Brasil', shortName: 'BB', color: '#f8d117', kind: 'bank' },
    { id: 'caixa', name: 'Caixa', shortName: 'CX', color: '#0b74b8', kind: 'bank' },
    { id: 'itau', name: 'Itaú', shortName: 'IT', color: '#ec7000', kind: 'bank' },
    { id: 'bradesco', name: 'Bradesco', shortName: 'B', color: '#cc163f', kind: 'bank' },
    { id: 'santander', name: 'Santander', shortName: 'ST', color: '#ec0000', kind: 'bank' },
    { id: 'nubank', name: 'Nubank', shortName: 'NU', color: '#820ad1', kind: 'bank' },
    { id: 'inter', name: 'Inter', shortName: 'IN', color: '#ff7a00', kind: 'bank' },
    { id: 'c6-bank', name: 'C6 Bank', shortName: 'C6', color: '#242424', kind: 'bank' },
    { id: 'mercado-pago', name: 'Mercado Pago', shortName: 'MP', color: '#00a9e8', kind: 'wallet' },
    { id: 'picpay', name: 'PicPay', shortName: 'PP', color: '#21c25e', kind: 'wallet' },
    { id: 'pagbank', name: 'PagBank', shortName: 'PB', color: '#00a868', kind: 'bank' },
    { id: 'btg', name: 'BTG Pactual', shortName: 'BTG', color: '#0b1d3a', kind: 'bank' },
    { id: 'xp', name: 'XP', shortName: 'XP', color: '#111111', kind: 'broker' },
    { id: 'sicredi', name: 'Sicredi', shortName: 'SC', color: '#4b9f2d', kind: 'cooperative' },
    { id: 'sicoob', name: 'Sicoob', shortName: 'SB', color: '#0a7f65', kind: 'cooperative' },
    { id: 'banco-pan', name: 'Banco PAN', shortName: 'PAN', color: '#00a8e8', kind: 'bank' },
    { id: 'banco-bv', name: 'Banco BV', shortName: 'BV', color: '#2448f6', kind: 'bank' },
    { id: 'safra', name: 'Safra', shortName: 'SF', color: '#173d2b', kind: 'bank' },
    { id: 'banrisul', name: 'Banrisul', shortName: 'BRS', color: '#1565a6', kind: 'bank' },
    { id: 'banco-do-nordeste', name: 'Banco do Nordeste', shortName: 'BNB', color: '#d71920', kind: 'bank' },
    { id: 'brb', name: 'BRB', shortName: 'BRB', color: '#0d5eaf', kind: 'bank' },
    { id: 'banestes', name: 'Banestes', shortName: 'BAN', color: '#1b62a5', kind: 'bank' },
    { id: 'bmg', name: 'BMG', shortName: 'BMG', color: '#ff6b00', kind: 'bank' },
    { id: 'daycoval', name: 'Daycoval', shortName: 'DAY', color: '#204a87', kind: 'bank' },
    { id: 'agibank', name: 'Agibank', shortName: 'AGI', color: '#282828', kind: 'bank' },
    { id: 'neon', name: 'Neon', shortName: 'NE', color: '#00e1ff', kind: 'bank' },
    { id: 'next', name: 'Next', shortName: 'NX', color: '#00c875', kind: 'bank' },
    { id: 'will-bank', name: 'Will Bank', shortName: 'WB', color: '#ffd500', kind: 'bank' },
    { id: 'banco-original', name: 'Banco Original', shortName: 'OR', color: '#00a86b', kind: 'bank' },
    { id: 'rico', name: 'Rico', shortName: 'RI', color: '#ff6a13', kind: 'broker' },
    { id: 'caju', name: 'Caju', shortName: 'CJ', color: '#ff5c3e', kind: 'benefit' },
    { id: 'custom', name: 'Outra instituição', shortName: '+', color: '#58708f', kind: 'other' }
];
export function listInstitutions() {
    return CATALOG;
}
export function getInstitution(id) {
    if (!id)
        return null;
    return CATALOG.find((item) => item.id === id) ?? null;
}
