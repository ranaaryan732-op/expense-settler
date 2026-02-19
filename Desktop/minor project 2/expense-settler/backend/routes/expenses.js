const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// GET all expenses (optionally filter by member)
router.get('/', (req, res) => {
    const db = readDB();
    const { memberId } = req.query;

    let expenses = db.expenses;
    if (memberId) {
        expenses = expenses.filter(
            (e) =>
                e.paidBy === memberId ||
                (e.splitAmong || []).includes(memberId)
        );
    }

    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(expenses);
});

// GET single expense
router.get('/:id', (req, res) => {
    const db = readDB();
    const expense = db.expenses.find((e) => e.id === req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });
    res.json(expense);
});

// POST add a new expense
router.post('/', (req, res) => {
    const { title, amount, paidBy, splitAmong, category, date } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required.' });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'A valid positive amount is required.' });
    }
    if (!paidBy) {
        return res.status(400).json({ error: 'paidBy member is required.' });
    }
    if (!splitAmong || !Array.isArray(splitAmong) || splitAmong.length === 0) {
        return res.status(400).json({ error: 'splitAmong must be a non-empty array.' });
    }

    const db = readDB();

    // Validate member IDs
    const memberIds = db.members.map((m) => m.id);
    if (!memberIds.includes(paidBy)) {
        return res.status(400).json({ error: 'paidBy member does not exist.' });
    }
    const invalidSplit = splitAmong.filter((id) => !memberIds.includes(id));
    if (invalidSplit.length > 0) {
        return res.status(400).json({ error: 'Some splitAmong members do not exist.' });
    }

    const newExpense = {
        id: uuidv4(),
        title: title.trim(),
        amount: parseFloat(Number(amount).toFixed(2)),
        paidBy,
        splitAmong,
        category: category || 'General',
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    db.expenses.push(newExpense);
    writeDB(db);
    res.status(201).json(newExpense);
});

// PUT update an expense
router.put('/:id', (req, res) => {
    const db = readDB();
    const index = db.expenses.findIndex((e) => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Expense not found.' });

    const { title, amount, paidBy, splitAmong, category, date } = req.body;
    const existing = db.expenses[index];

    const updated = {
        ...existing,
        title: title?.trim() || existing.title,
        amount: amount != null ? parseFloat(Number(amount).toFixed(2)) : existing.amount,
        paidBy: paidBy || existing.paidBy,
        splitAmong: Array.isArray(splitAmong) && splitAmong.length ? splitAmong : existing.splitAmong,
        category: category || existing.category,
        date: date ? new Date(date).toISOString() : existing.date,
        updatedAt: new Date().toISOString(),
    };

    db.expenses[index] = updated;
    writeDB(db);
    res.json(updated);
});

// DELETE an expense
router.delete('/:id', (req, res) => {
    const db = readDB();
    const index = db.expenses.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Expense not found.' });
    }
    db.expenses.splice(index, 1);
    writeDB(db);
    res.json({ message: 'Expense deleted successfully.' });
});

module.exports = router;
