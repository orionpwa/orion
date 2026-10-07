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

function moneyAfter(text, patterns, maxDistance = 160) {
    for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (!match)
            continue;
        const tail = text.slice(match.index + match[0].length, match.index + match[0].length + maxDistance);
        const money = tail.match(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/i);
        if (money)
            return parseMoney(money[1]);
    }
    return null;
}

function parseYear(text) {
    const patterns = [
        /ano[- ]calend[aá]rio\s*[:\-]?\s*(20\d{2})/i,
        /ano[- ]base\s*[:\-]?\s*(20\d{2})/i,
        /exerc[ií]cio\s*[:\-]?\s*(20\d{2})/i,
        /informe(?:\s+de)?\s+rendimentos[^\n]{0,40}(20\d{2})/i
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

function parseInstitution(text) {
    if (/\bbradesco\b/i.test(text))
        return { institutionId: 'bradesco', institutionName: 'Bradesco' };
    if (/\bbanco\s+inter\b|\binter\s+(?:d&o|medium|pagamentos|bank)\b|\binter\b/i.test(text))
        return { institutionId: 'inter', institutionName: 'Inter' };
    const patterns = [
        /(?:institui[cç][aã]o financeira|institui[cç][aã]o|fonte pagadora)\s*[:\-]?\s*([^\n]{3,100})/i,
        /(?:raz[aã]o social|nome empresarial)\s*[:\-]?\s*([^\n]{3,100})/i
    ];
    for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match)
            return { institutionId: 'custom', institutionName: match[1].trim() };
    }
    return { institutionId: 'custom', institutionName: '' };
}

export function parseFinancialReportText(source) {
    const text = normalizeText(source);
    const year = parseYear(text);
    const { institutionId, institutionName } = parseInstitution(text);
    const institutionCnpj = parseCnpj(text);
    const yearEndBalance = moneyAfter(text, [
        /saldo(?:\s+em|\s+na data de)?\s*31[\/\.\-]12(?:[\/\.\-]20\d{2})?/i,
        /posi[cç][aã]o(?:\s+em)?\s*31[\/\.\-]12(?:[\/\.\-]20\d{2})?/i,
        /saldo final/i
    ]);
    const taxableIncome = moneyAfter(text, [
        /rendimentos tribut[aá]veis/i,
        /rendimentos sujeitos ao ajuste anual/i
    ]);
    const exemptIncome = moneyAfter(text, [
        /rendimentos isentos(?:\s+e n[aã]o tribut[aá]veis)?/i,
        /isentos e n[aã]o tribut[aá]veis/i
    ]);
    const exclusiveIncome = moneyAfter(text, [
        /rendimentos sujeitos [àa] tributa[cç][aã]o exclusiva/i,
        /tributa[cç][aã]o exclusiva(?:\/definitiva)?/i
    ]);
    const irrf = moneyAfter(text, [
        /imposto(?:\s+(?:sobre a renda|de renda))?\s+retido na fonte/i,
        /\birrf\b/i
    ]);
    const known = [year, institutionName, institutionCnpj, yearEndBalance, taxableIncome, exemptIncome, exclusiveIncome, irrf]
        .filter((value) => value !== null && value !== '').length;
    return {
        year,
        institutionId,
        institutionName,
        institutionCnpj,
        yearEndBalance,
        taxableIncome,
        exemptIncome,
        exclusiveIncome,
        irrf,
        confidence: known >= 5 ? 'high' : known >= 3 ? 'medium' : 'low'
    };
}
