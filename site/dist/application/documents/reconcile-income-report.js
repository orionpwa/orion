function safeMoney(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function compare(label, payslipValue, reportValue, note) {
    const difference = safeMoney(payslipValue) - safeMoney(reportValue);
    const absolute = Math.abs(difference);
    const status = absolute <= 100 ? 'aligned' : absolute <= 500 ? 'close' : 'review';
    return { label, payslipValue: safeMoney(payslipValue), reportValue: safeMoney(reportValue), difference, status, note };
}

export function reconcileIncomeReport(annualSummary, report) {
    if (!annualSummary || !report)
        throw new TypeError('Resumo anual e Informe de Rendimentos são obrigatórios para a conciliação.');
    const reportGrossComparable = safeMoney(report.taxableIncome) + safeMoney(report.thirteenthSalary);
    const reportIrrfComparable = safeMoney(report.irrf) + safeMoney(report.thirteenthIrrf);
    return {
        year: annualSummary.year,
        employer: report.employer || '',
        employerCnpj: report.employerCnpj || '',
        rows: [
            compare('Rendimentos', annualSummary.totals.grossEarnings, reportGrossComparable, 'A soma dos holerites pode conter verbas com tratamento diferente do Informe. Diferença não significa erro automaticamente.'),
            compare('INSS', annualSummary.totals.inssDiscount, report.officialPension, 'Compara o INSS identificado nos holerites com a contribuição previdenciária oficial do Informe.'),
            compare('IRRF', annualSummary.totals.irrfDiscount, reportIrrfComparable, 'Compara o IRRF dos holerites com o IRRF anual, incluindo o 13º quando informado separadamente.')
        ]
    };
}
