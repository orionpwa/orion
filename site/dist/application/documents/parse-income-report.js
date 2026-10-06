function normalizeText(value) {
    return String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\r/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
}

function parseMoney(value) {
    if (typeof value !== 'string' || !value.trim())
        return null;
    const normalized = value.replace(/R\$/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}

function moneyAfter(text, labelPattern, maxDistance = 120) {
    const match = labelPattern.exec(text);
    if (!match)
        return null;
    const tail = text.slice(match.index + match[0].length, match.index + match[0].length + maxDistance);
    const money = tail.match(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/i);
    return money ? parseMoney(money[1]) : null;
}

function parseYear(text) {
    const patterns = [
        /ano[- ]calend[aá]rio\s*[:\-]?\s*(20\d{2})/i,
        /ano[- ]base\s*[:\-]?\s*(20\d{2})/i,
        /exerc[ií]cio\s*[:\-]?\s*(20\d{2})/i
    ];
    for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match)
            return Number(match[1]);
    }
    return null;
}

function parseCnpj(text) {
    const match = text.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/);
    return match?.[0] ?? '';
}

function parseEmployer(text) {
    const patterns = [
        /(?:nome da fonte pagadora|nome empresarial)\s*[:\-]?\s*([^\n]{3,100})/i,
        /fonte pagadora\s*[:\-]?\s*([^\n]{3,100})/i
    ];
    for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
            const value = match[1].replace(/\s{2,}/g, ' ').trim();
            if (value)
                return value;
        }
    }
    return '';
}

export function parseIncomeReportText(source) {
    const text = normalizeText(source);
    const year = parseYear(text);
    const employerCnpj = parseCnpj(text);
    const employer = parseEmployer(text);
    const taxableIncome = moneyAfter(text, /total dos rendimentos(?:\s*\(inclusive f[eé]rias\))?/i);
    const officialPension = moneyAfter(text, /contribui[cç][aã]o previdenci[aá]ria oficial/i);
    const privatePension = moneyAfter(text, /contribui[cç][aã]o a entidades de previd[eê]ncia complementar/i);
    const alimony = moneyAfter(text, /pens[aã]o aliment[ií]cia/i);
    const irrf = moneyAfter(text, /imposto sobre a renda retido na fonte/i);
    const thirteenthSalary = moneyAfter(text, /d[eé]cimo terceiro sal[aá]rio/i);
    const thirteenthIrrf = moneyAfter(text, /imposto sobre a renda retido na fonte(?:\s*)sobre(?:\s*)d[eé]cimo terceiro|irrf(?:\s*)sobre(?:\s*)13/i);
    const fields = [year, employerCnpj, taxableIncome, officialPension, irrf];
    const known = fields.filter((value) => value !== null && value !== '').length;
    return {
        year,
        employer,
        employerCnpj,
        taxableIncome,
        officialPension,
        privatePension,
        alimony,
        irrf,
        thirteenthSalary,
        thirteenthIrrf,
        confidence: known >= 4 ? 'high' : known >= 2 ? 'medium' : 'low'
    };
}
