const MONTHS = new Map([
    ['janeiro', '01'], ['fevereiro', '02'], ['marco', '03'], ['abril', '04'], ['maio', '05'], ['junho', '06'],
    ['julho', '07'], ['agosto', '08'], ['setembro', '09'], ['outubro', '10'], ['novembro', '11'], ['dezembro', '12']
]);

function normalize(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function moneyToCents(value) {
    if (!value)
        return null;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const number = Number(normalized);
    return Number.isFinite(number) ? Math.round(number * 100) : null;
}

function findMoney(text, pattern) {
    const match = text.match(pattern);
    return match ? moneyToCents(match[1]) : null;
}

function lastMoney(line) {
    const matches = [...line.matchAll(/([\d.]+,\d{2})/g)];
    return matches.length ? moneyToCents(matches[matches.length - 1][1]) : null;
}

function findLine(text, predicate) {
    return text.split(/\r?\n/).find((line) => predicate(normalize(line).toLowerCase()));
}

function competenceFor(text) {
    const normalized = normalize(text).toLowerCase();
    const pattern = new RegExp(`\\b(${[...MONTHS.keys()].join('|')})\\s*\\/\\s*(20\\d{2})\\b`, 'i');
    const match = normalized.match(pattern);
    if (!match)
        return '';
    return `${match[2]}-${MONTHS.get(match[1].toLowerCase())}`;
}

function employerFor(text) {
    const line = text.split(/\r?\n/).find((item) => /recibo de pagamento de sal[aá]rio/i.test(item));
    if (!line)
        return '';
    return line
        .replace(/recibo de pagamento de sal[aá]rio.*$/i, '')
        .replace(/^\s*\d+\s+/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function cnpjFor(text) {
    const match = text.match(/CNPJ\s*:?\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i);
    return match?.[1] ?? '';
}

export function parsePayslipText(text) {
    const normalizedText = normalize(text);
    const salaryLine = findLine(text, (line) => line.includes('salario mensalista'));
    const inssLine = findLine(text, (line) => line.includes(' inss') && !line.includes('base inss'));
    const irrfLine = findLine(text, (line) => line.includes(' irrf') && !line.includes('base irrf'));
    const premiumLine = findLine(text, (line) => line.includes('premio'));
    const benefitLine = findLine(text, (line) => line.includes('va/vr') || line.includes('vale alimentacao') || line.includes('vale refeicao'));
    const totalsMatch = normalizedText.match(/Totais\s+([\d.]+,\d{2})\s+([\d.]+,\d{2})/i);
    let grossEarnings = totalsMatch ? moneyToCents(totalsMatch[1]) : null;
    let totalDeductions = totalsMatch ? moneyToCents(totalsMatch[2]) : null;
    const netPay = findMoney(normalizedText, /SALARIO LIQUIDO\s*(?:R\$)?\s*([\d.]+,\d{2})/i);
    const salaryBase = findMoney(normalizedText, /Salario base\s+([\d.]+,\d{2})/i) ?? (salaryLine ? lastMoney(salaryLine) : null);
    if (grossEarnings === null && netPay !== null && totalDeductions !== null)
        grossEarnings = netPay + totalDeductions;
    if (totalDeductions === null && grossEarnings !== null && netPay !== null)
        totalDeductions = Math.max(0, grossEarnings - netPay);
    const result = {
        competence: competenceFor(text),
        employer: employerFor(text),
        employerCnpj: cnpjFor(text),
        salaryBase,
        grossEarnings,
        totalDeductions,
        netPay,
        inssDiscount: inssLine ? lastMoney(inssLine) : null,
        irrfDiscount: irrfLine ? lastMoney(irrfLine) : null,
        fgtsValue: findMoney(normalizedText, /Valor FGTS\s+([\d.]+,\d{2})/i),
        baseInss: findMoney(normalizedText, /Base INSS\s+([\d.]+,\d{2})/i),
        baseFgts: findMoney(normalizedText, /Base FGTS\s+([\d.]+,\d{2})/i),
        baseIrrf: findMoney(normalizedText, /Base IRRF\s+([\d.]+,\d{2})/i),
        premium: premiumLine ? lastMoney(premiumLine) : null,
        benefitDiscount: benefitLine ? lastMoney(benefitLine) : null
    };
    const required = [result.competence, result.salaryBase, result.netPay];
    result.confidence = required.filter((value) => value !== null && value !== '').length === required.length ? 'high' : 'review';
    return result;
}
