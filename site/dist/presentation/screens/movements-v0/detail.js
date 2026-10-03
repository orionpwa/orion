import { deleteTransaction, undoTransactionMutation } from '../../../application/transactions/mutate-transaction.js';
import { isEditableManualTransaction } from '../../../application/transactions/update-manual-transaction.js';
import { formatBRL } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { showActionToast, showToast } from '../../components/feedback.js';
import { movementKindLabel, movementLabel, movementSign, movementTone } from './shared.js';
function detailRow(label, value) {
    return el('div', 'movement-detail-row-v0', [
        el('span', 'movement-detail-label-v0', [label]),
        el('strong', 'movement-detail-value-v0', [value])
    ]);
}
function paymentMethodLabel(value) {
    switch (value) {
        case 'pix': return 'Pix';
        case 'debit': return 'Débito';
        case 'cash': return 'Dinheiro';
        case 'credit-rail': return 'Crédito em saldo/benefício';
        case 'other': return 'Outro';
        default: return value;
    }
}
function dateLabel(dateKey) {
    const [year, month, day] = dateKey.split('-');
    return `${day ?? '--'}/${month ?? '--'}/${year ?? '----'}`;
}
async function movementContextRows(repositories, transaction) {
    const rows = [];
    const accountName = async (id) => (await repositories.accounts.getById(id))?.name ?? 'Conta não encontrada';
    if ('categoryId' in transaction && transaction.categoryId)
        rows.push(detailRow('Categoria', transaction.categoryId));
    if (transaction.kind === 'income' || transaction.kind === 'yield') {
        rows.push(detailRow('Conta', await accountName(transaction.accountId)));
    }
    else if (transaction.kind === 'expense') {
        if (transaction.settlement.kind === 'account') {
            rows.push(detailRow('Conta', await accountName(transaction.settlement.accountId)));
            rows.push(detailRow('Pagamento', paymentMethodLabel(transaction.settlement.method)));
        }
        else {
            const card = await repositories.creditCards.getById(transaction.settlement.creditCardId);
            rows.push(detailRow('Cartão', card?.name ?? 'Cartão não encontrado'));
        }
    }
    else if (transaction.kind === 'transfer') {
        rows.push(detailRow('Origem', await accountName(transaction.fromAccountId)));
        rows.push(detailRow('Destino', await accountName(transaction.toAccountId)));
    }
    else if (transaction.kind === 'debt-payment') {
        const [debt, account] = await Promise.all([
            repositories.debts.getById(transaction.debtId),
            repositories.accounts.getById(transaction.accountId)
        ]);
        rows.push(detailRow('Dívida', debt?.name ?? 'Dívida não encontrada'));
        rows.push(detailRow('Conta', account?.name ?? 'Conta não encontrada'));
    }
    else if (transaction.kind === 'credit-card-payment') {
        const card = await repositories.creditCards.getById(transaction.creditCardId);
        rows.push(detailRow('Cartão', card?.name ?? 'Cartão não encontrado'));
        if (transaction.source.kind === 'account')
            rows.push(detailRow('Conta de origem', await accountName(transaction.source.accountId)));
        else {
            const asset = await repositories.assets.getById(transaction.source.assetId);
            rows.push(detailRow('Origem', asset?.name ?? 'Garantia não encontrada'));
        }
    }
    else if (transaction.kind === 'asset-contribution' || transaction.kind === 'asset-withdrawal') {
        const [asset, account] = await Promise.all([
            repositories.assets.getById(transaction.assetId),
            repositories.accounts.getById(transaction.accountId)
        ]);
        rows.push(detailRow('Ativo', asset?.name ?? 'Ativo não encontrado'));
        rows.push(detailRow('Conta', account?.name ?? 'Conta não encontrada'));
    }
    else if (transaction.kind === 'asset-yield' || transaction.kind === 'asset-valuation') {
        const asset = await repositories.assets.getById(transaction.assetId);
        rows.push(detailRow('Ativo', asset?.name ?? 'Ativo não encontrado'));
    }
    rows.push(detailRow('Data', dateLabel(transaction.date)));
    return rows;
}
export async function renderMovementDetailV0(repositories, profile, mutations, transactionId, actions) {
    const transaction = await repositories.transactions.getById(transactionId);
    const root = el('div', 'movement-internal-screen-v0 movement-detail-screen-v0');
    if (!transaction || transaction.profileId !== profile.id) {
        root.append(el('section', 'movements-empty-v0', [el('strong', '', ['Movimentação não encontrada.'])]));
        return root;
    }
    const amount = `${movementSign(transaction)}${formatBRL(transaction.amount)}`;
    const heading = el('section', 'movement-detail-heading-v0', [
        el('span', 'movement-detail-kind-v0', [movementKindLabel(transaction)]),
        el('strong', `movement-detail-amount-v0 ${movementTone(transaction)}`, [amount]),
        el('span', 'movement-detail-description-v0', [movementLabel(transaction)])
    ]);
    const fields = el('section', 'movement-detail-fields-v0');
    for (const row of await movementContextRows(repositories, transaction))
        fields.append(row);
    const actionsBlock = el('section', 'movement-detail-actions-v0');
    if (isEditableManualTransaction(transaction)) {
        const edit = el('button', 'movement-button-primary-v0', ['Editar']);
        edit.type = 'button';
        edit.addEventListener('click', actions.onEdit);
        actionsBlock.append(edit);
    }
    else {
        actionsBlock.append(el('p', 'movement-detail-note-v0', [
            transaction.kind === 'debt-payment' || transaction.kind === 'credit-card-payment'
                ? 'Este pagamento é gerenciado pelo item ao qual está vinculado.'
                : 'Este registro é gerenciado por uma área especializada do Orion.'
        ]));
    }
    const isPayment = transaction.kind === 'debt-payment' || transaction.kind === 'credit-card-payment';
    const removeLabel = isPayment ? 'Desfazer pagamento' : 'Excluir movimentação';
    const remove = el('button', 'movement-button-danger-v0', [removeLabel]);
    remove.type = 'button';
    const confirmation = el('div', 'movement-delete-confirm-v0');
    confirmation.hidden = true;
    const confirmText = el('p', '', [isPayment ? 'Deseja desfazer este pagamento?' : 'Deseja excluir esta movimentação?']);
    const cancel = el('button', 'movement-button-secondary-v0', ['Cancelar']);
    cancel.type = 'button';
    const confirm = el('button', 'movement-button-danger-v0', [removeLabel]);
    confirm.type = 'button';
    confirmation.append(confirmText, el('div', 'movement-confirm-actions-v0', [cancel, confirm]));
    remove.addEventListener('click', () => { remove.hidden = true; confirmation.hidden = false; });
    cancel.addEventListener('click', () => { confirmation.hidden = true; remove.hidden = false; });
    confirm.addEventListener('click', () => {
        confirm.disabled = true;
        void deleteTransaction(mutations, profile.id, transaction.id)
            .then((event) => {
            actions.onDeleted();
            showActionToast(isPayment ? 'Pagamento desfeito.' : 'Movimentação excluída.', 'Desfazer', () => {
                void undoTransactionMutation(mutations, profile.id, event.id)
                    .then(() => {
                    actions.onRestored();
                    showToast(isPayment ? 'Pagamento restaurado.' : 'Movimentação restaurada.', 'success');
                })
                    .catch((failure) => showToast(failure instanceof Error ? failure.message : 'Não foi possível desfazer.', 'error'));
            });
        })
            .catch((failure) => {
            confirm.disabled = false;
            showToast(failure instanceof Error ? failure.message : 'Não foi possível concluir a exclusão.', 'error');
        });
    });
    actionsBlock.append(remove, confirmation);
    root.append(heading, fields, actionsBlock);
    return root;
}
