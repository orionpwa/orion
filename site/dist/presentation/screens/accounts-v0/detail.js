import { getDashboardSnapshot } from '../../../application/dashboard/get-dashboard.js';
import { formatBRL } from '../../../domain/money/money.js';
import { el } from '../../dom.js';
import { deactivateWithUndoFeedback } from '../../components/lifecycle-feedback.js';
import { accountInstitutionLabel, accountMovementAmount, accountMovementLabel, accountMovements, accountTypeLabel, formatDateBR } from './shared.js';
function detailRow(label, value) {
    return el('div', 'account-detail-row-v0', [
        el('dt', '', [label]),
        el('dd', '', [value])
    ]);
}
export async function renderAccountDetailV0(context, accountId, actions) {
    const [snapshot, account] = await Promise.all([
        getDashboardSnapshot(context.repositories, context.profile.id),
        context.repositories.accounts.getById(accountId)
    ]);
    if (!account || account.profileId !== context.profile.id || !account.active)
        throw new TypeError('Conta não encontrada.');
    const balance = snapshot.balances.get(account.id) ?? account.openingBalance;
    const movements = accountMovements(snapshot.transactions, account.id);
    const recent = movements.slice(0, 5);
    const root = el('div', 'account-internal-screen-v0 account-detail-screen-v0');
    root.append(el('section', 'account-detail-hero-v0', [
        el('small', '', ['SALDO ATUAL']),
        el('strong', '', [formatBRL(balance)]),
        el('span', '', [account.name])
    ]));
    root.append(el('dl', 'account-detail-list-v0', [
        detailRow('Instituição', accountInstitutionLabel(account)),
        detailRow('Tipo', accountTypeLabel(account)),
        detailRow('Disponível para uso', account.includeInAvailable === false ? 'Não' : 'Sim'),
        detailRow('Saldo inicial', formatBRL(account.openingBalance))
    ]));
    const actionsBlock = el('section', 'account-action-stack-v0');
    const edit = el('button', 'account-primary-action-v0', ['Editar conta']);
    edit.type = 'button';
    edit.addEventListener('click', actions.onEdit);
    actionsBlock.append(edit);
    root.append(actionsBlock, el('div', 'account-section-heading-v0', [el('h2', '', ['Movimentações desta conta'])]));
    if (recent.length === 0) {
        root.append(el('div', 'accounts-empty-v0', ['Nenhuma movimentação nesta conta.']));
    }
    else {
        const list = el('div', 'account-movement-list-v0');
        for (const transaction of recent) {
            const amount = accountMovementAmount(transaction, account.id);
            const row = el('button', 'account-movement-row-v0', [
                el('span', '', [
                    el('strong', '', [accountMovementLabel(transaction)]),
                    el('small', '', [formatDateBR(transaction.date)])
                ]),
                el('strong', `account-movement-value-v0 ${amount.tone}`, [`${amount.sign}${formatBRL(transaction.amount)}`])
            ]);
            row.type = 'button';
            row.addEventListener('click', () => actions.onOpenMovement(transaction.id));
            list.append(row);
        }
        root.append(list);
    }
    if (movements.length > recent.length) {
        const all = el('button', 'accounts-text-action-v0', ['Ver todos os movimentos']);
        all.type = 'button';
        all.addEventListener('click', actions.onViewAllMovements);
        root.append(all);
    }
    const deactivate = el('button', 'account-danger-action-v0', ['Desativar conta']);
    deactivate.type = 'button';
    const confirm = el('div', 'account-confirm-v0');
    confirm.hidden = true;
    const cancel = el('button', 'account-secondary-action-v0', ['Cancelar']);
    cancel.type = 'button';
    const confirmButton = el('button', 'account-danger-confirm-v0', ['Desativar']);
    confirmButton.type = 'button';
    confirm.append(el('p', '', ['As movimentações existentes serão preservadas. A conta deixará de aparecer entre as contas ativas.']), el('div', 'account-confirm-actions-v0', [cancel, confirmButton]));
    deactivate.addEventListener('click', () => { deactivate.hidden = true; confirm.hidden = false; });
    cancel.addEventListener('click', () => { confirm.hidden = true; deactivate.hidden = false; });
    confirmButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        deactivateWithUndoFeedback(context.lifecycle, context.profile.id, 'account', account.id, 'Conta', actions.onDeactivated);
    });
    root.append(el('section', 'account-danger-zone-v0', [deactivate, confirm]));
    return root;
}
