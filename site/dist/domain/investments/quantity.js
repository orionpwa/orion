import { QUANTITY_SCALE } from './models.js';
function decimalsForScale(scale) {
    if (!Number.isSafeInteger(scale) || scale <= 0)
        throw new RangeError('Escala de quantidade inválida.');
    const text = String(scale);
    if (!/^10+$/.test(text))
        throw new RangeError('Escala de quantidade deve ser potência de 10.');
    return text.length - 1;
}
export function quantityScaleForInstrument(instrument) {
    return instrument?.quantityScale ?? QUANTITY_SCALE;
}
export function quantityUnits(value) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new RangeError('Quantidade interna deve ser inteiro seguro não negativo.');
    return value;
}
export function parseQuantity(value, scale = QUANTITY_SCALE) {
    const decimals = decimalsForScale(scale);
    const normalized = value.trim().replace(',', '.');
    const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
    if (!pattern.test(normalized))
        throw new TypeError(`Quantidade inválida. Use até ${decimals} casas decimais.`);
    const [whole = '0', fraction = ''] = normalized.split('.');
    const padded = fraction.padEnd(decimals, '0');
    const result = Number(whole) * scale + Number(padded || '0');
    return quantityUnits(result);
}
export function formatQuantity(value, scale = QUANTITY_SCALE) {
    const decimals = decimalsForScale(scale);
    const whole = Math.trunc(value / scale);
    const fraction = String(value % scale).padStart(decimals, '0').replace(/0+$/, '');
    return fraction ? `${whole},${fraction}` : String(whole);
}
