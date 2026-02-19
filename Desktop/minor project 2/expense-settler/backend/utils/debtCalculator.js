/**
 * Debt Calculator Utility
 * Simplifies debts among members using a net-balance approach.
 * Minimizes the total number of transactions needed to settle all debts.
 */

/**
 * Compute simplified debts from a list of expenses and members.
 * @param {Array} members  - Array of member objects { id, name }
 * @param {Array} expenses - Array of expense objects { id, title, amount, paidBy, splitAmong, date }
 * @returns {Array} settlements - Array of { from, to, amount } objects
 */
function calculateDebts(members, expenses) {
    // Step 1: Build a net balance map  (memberId -> net amount)
    // Positive = owed money, Negative = owes money
    const balance = {};
    members.forEach((m) => (balance[m.id] = 0));

    expenses.forEach((expense) => {
        const { amount, paidBy, splitAmong } = expense;
        if (!splitAmong || splitAmong.length === 0) return;

        const share = parseFloat((amount / splitAmong.length).toFixed(2));

        // Payer gets credited the full amount
        balance[paidBy] = (balance[paidBy] || 0) + amount;

        // Each participant is debited their share
        splitAmong.forEach((memberId) => {
            balance[memberId] = (balance[memberId] || 0) - share;
        });
    });

    // Step 2: Separate into creditors (positive) and debtors (negative)
    const creditors = []; // { id, amount }
    const debtors = [];   // { id, amount }

    Object.entries(balance).forEach(([id, amt]) => {
        const rounded = parseFloat(amt.toFixed(2));
        if (rounded > 0) creditors.push({ id, amount: rounded });
        else if (rounded < 0) debtors.push({ id, amount: Math.abs(rounded) });
    });

    // Step 3: Greedy matching to minimize transactions
    const settlements = [];

    let i = 0; // creditor pointer
    let j = 0; // debtor pointer

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const settled = Math.min(creditor.amount, debtor.amount);
        settled > 0.01 &&
            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount: parseFloat(settled.toFixed(2)),
            });

        creditor.amount -= settled;
        debtor.amount -= settled;

        if (creditor.amount < 0.01) i++;
        if (debtor.amount < 0.01) j++;
    }

    return settlements;
}

/**
 * Get the net balance for each member.
 * Positive = they are owed money; Negative = they owe money.
 */
function getNetBalances(members, expenses) {
    const balance = {};
    members.forEach((m) => (balance[m.id] = 0));

    expenses.forEach((expense) => {
        const { amount, paidBy, splitAmong } = expense;
        if (!splitAmong || splitAmong.length === 0) return;
        const share = parseFloat((amount / splitAmong.length).toFixed(2));
        balance[paidBy] = (balance[paidBy] || 0) + amount;
        splitAmong.forEach((memberId) => {
            balance[memberId] = (balance[memberId] || 0) - share;
        });
    });

    return Object.entries(balance).map(([id, net]) => ({
        id,
        net: parseFloat(net.toFixed(2)),
    }));
}

module.exports = { calculateDebts, getNetBalances };
