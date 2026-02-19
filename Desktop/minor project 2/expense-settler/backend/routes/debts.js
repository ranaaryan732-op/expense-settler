const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { calculateDebts, getNetBalances } = require('../utils/debtCalculator');

const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
}

// GET simplified debts (who owes whom)
router.get('/', (req, res) => {
    const db = readDB();
    const settlements = calculateDebts(db.members, db.expenses);

    // Enrich with member names
    const memberMap = {};
    db.members.forEach((m) => (memberMap[m.id] = m.name));

    const enriched = settlements.map((s) => ({
        from: s.from,
        fromName: memberMap[s.from] || 'Unknown',
        to: s.to,
        toName: memberMap[s.to] || 'Unknown',
        amount: s.amount,
    }));

    res.json(enriched);
});

// GET net balances for all members
router.get('/balances', (req, res) => {
    const db = readDB();
    const balances = getNetBalances(db.members, db.expenses);

    const memberMap = {};
    db.members.forEach((m) => (memberMap[m.id] = m.name));

    const enriched = balances.map((b) => ({
        id: b.id,
        name: memberMap[b.id] || 'Unknown',
        net: b.net,
    }));

    res.json(enriched);
});

module.exports = router;
