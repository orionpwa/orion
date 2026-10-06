const MONEY_FIELDS = [
    'grossEarnings', 'totalDeductions', 'inssDiscount', 'irrfDiscount', 'netPay', 'fgtsValue'
];

function safeMoney(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function employerKey(item) {
    const cnpj = typeof item.employerCnpj === 'string' ? item.employerCnpj.trim() : '';
    const name = typeof item.employer === 'string' ? item.employer.trim() : '';
    return cnpj || name || 'empregador-nao-informado';
}

function employerLabel(item) {
    const name = typeof item.employer === 'string' && item.employer.trim() ? item.employer.trim() : 'Empregador não informado';
    const cnpj = typeof item.employerCnpj === 'string' && item.employerCnpj.trim() ? item.employerCnpj.trim() : '';
    return { name, cnpj };
}

export function availableTaxYears(payslips, currentYear = new Date().getFullYear()) {
    const years = new Set([currentYear]);
    for (const item of payslips) {
        const match = /^(\d{4})-\d{2}$/.exec(item.competence ?? '');
        if (match)
            years.add(Number(match[1]));
    }
    return [...years].sort((left, right) => right - left);
}

export function buildAnnualTaxPreparation(payslips, year) {
    if (!Number.isInteger(year) || year < 2000 || year > 2200)
        throw new RangeError('Ano-calendário inválido.');
    const prefix = `${year}-`;
    const documents = payslips
        .filter((item) => typeof item.competence === 'string' && item.competence.startsWith(prefix))
        .sort((left, right) => left.competence.localeCompare(right.competence));
    const totals = Object.fromEntries(MONEY_FIELDS.map((field) => [field, 0]));
    const completeness = Object.fromEntries(MONEY_FIELDS.map((field) => [field, 0]));
    const employers = new Map();
    for (const item of documents) {
        for (const field of MONEY_FIELDS) {
            totals[field] += safeMoney(item[field]);
            if (Number.isSafeInteger(item[field]) && item[field] >= 0)
                completeness[field] += 1;
        }
        const key = employerKey(item);
        if (!employers.has(key)) {
            const label = employerLabel(item);
            employers.set(key, {
                ...label,
                documentCount: 0,
                grossEarnings: 0,
                inssDiscount: 0,
                irrfDiscount: 0,
                netPay: 0,
                fgtsValue: 0
            });
        }
        const group = employers.get(key);
        group.documentCount += 1;
        group.grossEarnings += safeMoney(item.grossEarnings);
        group.inssDiscount += safeMoney(item.inssDiscount);
        group.irrfDiscount += safeMoney(item.irrfDiscount);
        group.netPay += safeMoney(item.netPay);
        group.fgtsValue += safeMoney(item.fgtsValue);
    }
    return {
        year,
        documentCount: documents.length,
        documents,
        totals,
        completeness,
        employers: [...employers.values()].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
    };
}

function csvValue(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
}

function centsToCsv(value) {
    return (safeMoney(value) / 100).toFixed(2).replace('.', ',');
}

export function annualTaxPreparationCsv(summary) {
    const rows = [
        ['Ano-calendário', summary.year],
        ['Holerites considerados', summary.documentCount],
        [],
        ['Competência', 'Empresa', 'CNPJ', 'Proventos', 'Descontos', 'INSS', 'IRRF', 'Líquido', 'FGTS']
    ];
    for (const item of summary.documents) {
        rows.push([
            item.competence,
            item.employer || '',
            item.employerCnpj || '',
            centsToCsv(item.grossEarnings),
            centsToCsv(item.totalDeductions),
            centsToCsv(item.inssDiscount),
            centsToCsv(item.irrfDiscount),
            centsToCsv(item.netPay),
            centsToCsv(item.fgtsValue)
        ]);
    }
    rows.push([], [
        'TOTAL', '', '',
        centsToCsv(summary.totals.grossEarnings),
        centsToCsv(summary.totals.totalDeductions),
        centsToCsv(summary.totals.inssDiscount),
        centsToCsv(summary.totals.irrfDiscount),
        centsToCsv(summary.totals.netPay),
        centsToCsv(summary.totals.fgtsValue)
    ]);
    return '\ufeff' + rows.map((row) => row.map(csvValue).join(';')).join('\n');
}
