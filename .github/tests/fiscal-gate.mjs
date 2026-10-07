import { parseIncomeReportText } from '../../site/dist/application/documents/parse-income-report.js';
import { parseFinancialReportText } from '../../site/dist/application/documents/parse-financial-report.js';
import { reconcileIncomeReport } from '../../site/dist/application/documents/reconcile-income-report.js';

function assertEqual(actual, expected, label) {
    if (actual !== expected)
        throw new Error(`${label}: ${actual} !== ${expected}`);
}

const incomeSample = `INFORME DE RENDIMENTOS
Ano-calendário: 2026
Nome da Fonte Pagadora: EMPRESA EXEMPLO LTDA
CNPJ: 12.345.678/0001-90
Total dos rendimentos (inclusive férias) R$ 30.000,00
Contribuição previdenciária oficial R$ 2.500,00
Imposto sobre a renda retido na fonte R$ 600,00
Décimo terceiro salário R$ 2.500,00
IRRF sobre 13º R$ 100,00`;
const income = parseIncomeReportText(incomeSample);
assertEqual(income.year, 2026, 'Ano do Informe de Rendimentos');
assertEqual(income.taxableIncome, 3000000, 'Rendimento tributável');
assertEqual(income.officialPension, 250000, 'Previdência oficial');
assertEqual(income.irrf, 60000, 'IRRF anual');

const financialSample = `INFORME FINANCEIRO
Ano-calendário: 2026
Banco Bradesco S.A.
CNPJ: 60.746.948/0001-12
Saldo em 31/12/2026 R$ 4.500,25
Rendimentos tributáveis R$ 120,00
Rendimentos isentos e não tributáveis R$ 80,50
Rendimentos sujeitos à tributação exclusiva R$ 44,00
Imposto de renda retido na fonte R$ 10,00`;
const financial = parseFinancialReportText(financialSample);
assertEqual(financial.year, 2026, 'Ano do informe financeiro');
assertEqual(financial.institutionId, 'bradesco', 'Instituição financeira');
assertEqual(financial.yearEndBalance, 450025, 'Posição em 31/12');
assertEqual(financial.taxableIncome, 12000, 'Rendimento tributável bancário');
assertEqual(financial.exemptIncome, 8050, 'Rendimento isento bancário');
assertEqual(financial.exclusiveIncome, 4400, 'Tributação exclusiva bancária');
assertEqual(financial.irrf, 1000, 'IRRF bancário');
if (financial.confidence !== 'high')
    throw new Error('Informe financeiro completo deve ter confiança alta.');

const reconciliation = reconcileIncomeReport({
    year: 2026,
    totals: { grossEarnings: 3250000, inssDiscount: 250000, irrfDiscount: 70000 }
}, {
    employer: 'EMPRESA EXEMPLO LTDA', employerCnpj: '12.345.678/0001-90',
    taxableIncome: 3000000, officialPension: 250000, irrf: 60000,
    thirteenthSalary: 250000, thirteenthIrrf: 10000
});
if (reconciliation.rows.length !== 3 || reconciliation.rows.some((row) => row.status !== 'aligned' || row.difference !== 0))
    throw new Error('Conciliação anual regrediu.');
