import { createAsset } from '../../application/assets/create-asset.js';
import { recordAssetOperation } from '../../application/assets/record-asset-operation.js';
import { updateAssetDetails } from '../../application/assets/update-asset.js';
import { getFinancialPosition } from '../../application/planning/get-financial-position.js';
import { calculateAssetPosition } from '../../domain/assets/position.js';
import { addCents, formatBRL, parseMajorToCents, subtractCents, sumCents, ZERO_CENTS } from '../../domain/money/money.js';
import { el } from '../dom.js';
import { deactivateWithUndoFeedback } from '../components/lifecycle-feedback.js';
import { accountErrorV0, accountInputFieldV0, accountMoneyFieldV0 } from './accounts-v0/controls.js';

function valueRow(label, value) {
    return el('div', 'patrimony-row-v1', [
        el('span', 'patrimony-row-label-v1', [label]),
        el('strong', 'patrimony-row-value-v1', [formatBRL(value)])
    ]);
}
function nonNegative(value) {
    return value < 0 ? ZERO_CENTS : value;
}
function centsToInput(value) {
    return (value / 100).toFixed(2).replace('.', ',');
}
function todayISO(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatDateBR(value) {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}
function detailRow(label, value) {
    return el('div', 'patrimony-asset-detail-row-v1', [
        el('dt', '', [label]),
        el('dd', '', [value])
    ]);
}
async function activeAssets(context) {
    return (await context.repositories.assets.listByProfile(context.profile.id))
        .filter((item) => item.active && item.kind !== 'guarantee');
}
async function assetWithPosition(context, assetId) {
    const [asset, transactions] = await Promise.all([
        context.repositories.assets.getById(assetId),
        context.repositories.transactions.listByProfile(context.profile.id)
    ]);
    if (!asset || asset.profileId !== context.profile.id || !asset.active || asset.kind === 'guarantee')
        throw new TypeError('Ativo não encontrado.');
    return { asset, transactions, position: calculateAssetPosition(asset, transactions) };
}
export async function renderPatrimonyV1(repositories, profile, actions = {}) {
    const position = await getFinancialPosition(repositories, profile.id);
    const registeredAssets = sumCents(position.assets
        .filter((item) => item.asset.includeInNetWorth)
        .map((item) => item.position.currentValue));
    const investments = sumCents(position.investments.map((item) => item.currentValue));
    const otherAssets = addCents(registeredAssets, investments);
    const cashAssets = nonNegative(subtractCents(position.netWorth.assets, otherAssets));
    const debts = sumCents(position.debts.map((item) => item.position.outstanding));
    const cards = sumCents(position.cards.map((item) => item.position.openLiability));
    const knownLiabilities = addCents(debts, cards);
    const accountLiabilities = nonNegative(subtractCents(position.netWorth.liabilities, knownLiabilities));
    const root = el('div', 'patrimony-screen-v1');
    const hero = el('section', 'patrimony-hero-v1', [
        el('span', 'patrimony-kicker-v1', ['PATRIMÔNIO LÍQUIDO']),
        el('strong', 'patrimony-net-v1', [formatBRL(position.netWorth.netWorth)]),
        el('div', 'patrimony-totals-v1', [
            valueRow('Ativos', position.netWorth.assets),
            valueRow('Passivos', position.netWorth.liabilities)
        ])
    ]);
    const assets = el('section', 'patrimony-section-v1', [
        el('h2', 'patrimony-section-title-v1', ['Ativos']),
        valueRow('Dinheiro em contas', cashAssets)
    ]);
    if (registeredAssets > 0)
        assets.append(valueRow('Outros ativos', registeredAssets));
    if (investments > 0)
        assets.append(valueRow('Investimentos', investments));
    if (actions.onManageAssets) {
        const manageAssets = el('button', 'patrimony-manage-action-v1', ['Gerenciar outros ativos']);
        manageAssets.type = 'button';
        manageAssets.addEventListener('click', actions.onManageAssets);
        assets.append(manageAssets);
    }
    const liabilities = el('section', 'patrimony-section-v1', [
        el('h2', 'patrimony-section-title-v1', ['Passivos'])
    ]);
    if (debts > 0)
        liabilities.append(valueRow('Dívidas', debts));
    if (cards > 0)
        liabilities.append(valueRow('Cartões de crédito', cards));
    if (accountLiabilities > 0)
        liabilities.append(valueRow('Saldos negativos em contas', accountLiabilities));
    if (position.netWorth.liabilities === 0)
        liabilities.append(el('div', 'patrimony-empty-v1', ['Nenhum passivo registrado.']));
    root.append(
        hero,
        assets,
        liabilities,
        el('p', 'patrimony-note-v1', ['Metas e reservas organizam o dinheiro disponível, mas não reduzem o patrimônio líquido.'])
    );
    return root;
}
export async function renderAssetListV1(context, actions) {
    const [assets, transactions] = await Promise.all([
        activeAssets(context),
        context.repositories.transactions.listByProfile(context.profile.id)
    ]);
    const root = el('div', 'patrimony-assets-screen-v1');
    root.append(el('p', 'patrimony-assets-support-v1', [
        'Use esta área para bens e outros valores que fazem parte do seu patrimônio, mas não são contas, investimentos, metas ou reservas.'
    ]));
    const create = el('button', 'patrimony-primary-action-v1', ['Adicionar ativo']);
    create.type = 'button';
    create.addEventListener('click', actions.onCreate);
    root.append(create);
    if (assets.length === 0) {
        root.append(el('div', 'patrimony-assets-empty-v1', ['Nenhum outro ativo cadastrado.']));
        return root;
    }
    const list = el('div', 'patrimony-assets-list-v1');
    for (const asset of assets) {
        const position = calculateAssetPosition(asset, transactions);
        const row = el('button', 'patrimony-asset-row-v1', [
            el('span', 'patrimony-asset-copy-v1', [
                el('strong', '', [asset.name]),
                el('small', '', ['Valor atual'])
            ]),
            el('strong', 'patrimony-asset-value-v1', [formatBRL(position.currentValue)]),
            el('span', 'patrimony-asset-chevron-v1', ['›'])
        ]);
        row.type = 'button';
        row.addEventListener('click', () => actions.onOpenDetail(asset.id));
        list.append(row);
    }
    root.append(list);
    return root;
}
export function renderNewAssetV1(context, actions) {
    const name = accountInputFieldV0('Nome do ativo');
    const opening = accountMoneyFieldV0('Valor atual');
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar ativo']);
    save.type = 'submit';
    const form = el('form', 'account-form-v0', [
        name.element,
        opening.element,
        el('p', 'patrimony-form-support-v1', ['O valor informado entra no patrimônio, mas não altera o saldo das suas contas.']),
        error.element,
        save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        void createAsset(context.repositories.assets, {
            profileId: context.profile.id,
            name: name.input.value,
            kind: 'other',
            openingValue: opening.input.value || '0',
            liquidity: 'restricted'
        }).then((created) => actions.onSaved(created.id))
            .catch((failure) => {
                save.disabled = false;
                error.show(failure instanceof Error ? failure.message : 'Não foi possível criar o ativo.');
            });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
export async function renderAssetDetailV1(context, assetId, actions) {
    const { asset, transactions, position } = await assetWithPosition(context, assetId);
    const history = [...transactions]
        .filter((transaction) => transaction.kind === 'asset-valuation' && transaction.assetId === asset.id)
        .sort((left, right) => right.date.localeCompare(left.date) || (right.createdAt ?? right.id).localeCompare(left.createdAt ?? left.id))
        .slice(0, 8);
    const root = el('div', 'patrimony-asset-detail-v1');
    root.append(el('section', 'patrimony-asset-hero-v1', [
        el('small', '', ['VALOR ATUAL']),
        el('strong', '', [formatBRL(position.currentValue)]),
        el('span', '', [asset.name])
    ]));
    root.append(el('dl', 'patrimony-asset-detail-list-v1', [
        detailRow('Valor inicial', formatBRL(asset.openingValue)),
        detailRow('Ajustes de valor', formatBRL(position.valuationDelta))
    ]));
    const actionsBox = el('section', 'patrimony-asset-actions-v1');
    const updateValue = el('button', 'account-primary-action-v0', ['Atualizar valor']);
    updateValue.type = 'button';
    updateValue.addEventListener('click', actions.onUpdateValue);
    const edit = el('button', 'account-secondary-action-v0', ['Editar ativo']);
    edit.type = 'button';
    edit.addEventListener('click', actions.onEdit);
    actionsBox.append(updateValue, edit);
    root.append(actionsBox, el('div', 'patrimony-asset-section-heading-v1', [el('h2', '', ['Histórico de valor'])]));
    if (history.length === 0) {
        root.append(el('div', 'patrimony-assets-empty-v1', ['Nenhuma atualização de valor registrada.']));
    } else {
        const list = el('div', 'patrimony-asset-history-v1');
        for (const transaction of history) {
            const positive = transaction.amount >= ZERO_CENTS;
            list.append(el('div', 'patrimony-asset-history-row-v1', [
                el('span', '', [
                    el('strong', '', [transaction.description ?? 'Atualização de valor']),
                    el('small', '', [formatDateBR(transaction.date)])
                ]),
                el('strong', positive ? 'positive' : 'negative', [formatBRL(transaction.amount)])
            ]));
        }
        root.append(list);
    }
    const deactivate = el('button', 'account-danger-action-v0', ['Desativar ativo']);
    deactivate.type = 'button';
    const confirm = el('div', 'account-confirm-v0');
    confirm.hidden = true;
    const cancel = el('button', 'account-secondary-action-v0', ['Cancelar']);
    cancel.type = 'button';
    const confirmButton = el('button', 'account-danger-confirm-v0', ['Desativar']);
    confirmButton.type = 'button';
    confirm.append(
        el('p', '', ['O histórico será preservado. O ativo deixará de compor o patrimônio enquanto estiver desativado.']),
        el('div', 'account-confirm-actions-v0', [cancel, confirmButton])
    );
    deactivate.addEventListener('click', () => { deactivate.hidden = true; confirm.hidden = false; });
    cancel.addEventListener('click', () => { confirm.hidden = true; deactivate.hidden = false; });
    confirmButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        deactivateWithUndoFeedback(context.lifecycle, context.profile.id, 'asset', asset.id, 'Ativo', actions.onDeactivated);
    });
    root.append(el('section', 'account-danger-zone-v0', [deactivate, confirm]));
    return root;
}
export async function renderEditAssetV1(context, assetId, actions) {
    const { asset, position } = await assetWithPosition(context, assetId);
    const name = accountInputFieldV0('Nome do ativo', asset.name);
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Salvar alterações']);
    save.type = 'submit';
    const current = el('div', 'account-static-field-v0', [
        el('span', 'account-field-label-v0', ['Valor atual']),
        el('strong', '', [formatBRL(position.currentValue)]),
        el('small', '', ['O valor é atualizado em uma ação separada para manter o histórico.'])
    ]);
    const form = el('form', 'account-form-v0', [name.element, current, error.element, save]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        void updateAssetDetails(context.repositories.assets, context.lifecycle, {
            profileId: context.profile.id,
            assetId: asset.id,
            name: name.input.value,
            liquidity: asset.liquidity,
            includeInNetWorth: asset.includeInNetWorth,
            ...(asset.policyId ? { policyId: asset.policyId } : {})
        }).then(() => actions.onSaved(asset.id))
            .catch((failure) => {
                save.disabled = false;
                error.show(failure instanceof Error ? failure.message : 'Não foi possível salvar o ativo.');
            });
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
export async function renderAssetValueV1(context, assetId, actions) {
    const { asset, position } = await assetWithPosition(context, assetId);
    const value = accountMoneyFieldV0('Novo valor atual', centsToInput(position.currentValue));
    const error = accountErrorV0();
    const save = el('button', 'account-primary-action-v0', ['Registrar novo valor']);
    save.type = 'submit';
    const form = el('form', 'account-form-v0', [
        value.element,
        el('p', 'patrimony-form-support-v1', ['Essa atualização ajusta o patrimônio sem criar entrada ou saída em conta.']),
        error.element,
        save
    ]);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        error.clear();
        save.disabled = true;
        try {
            const target = parseMajorToCents(value.input.value);
            if (target < ZERO_CENTS)
                throw new RangeError('O valor atual não pode ser negativo.');
            const delta = subtractCents(target, position.currentValue);
            if (delta === ZERO_CENTS)
                throw new RangeError('O valor informado já é o valor atual.');
            void recordAssetOperation(context.repositories.transactions, context.repositories.assets, context.repositories.accounts, {
                profileId: context.profile.id,
                assetId: asset.id,
                kind: 'valuation',
                amount: centsToInput(delta),
                date: todayISO(),
                description: `Atualização de valor · ${asset.name}`
            }).then(() => actions.onCompleted(asset.id))
                .catch((failure) => {
                    save.disabled = false;
                    error.show(failure instanceof Error ? failure.message : 'Não foi possível atualizar o valor.');
                });
        } catch (failure) {
            save.disabled = false;
            error.show(failure instanceof Error ? failure.message : 'Valor inválido.');
        }
    });
    return el('div', 'account-internal-screen-v0 account-form-screen-v0', [form]);
}
