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

// GET all members
router.get('/', (req, res) => {
    const db = readDB();
    res.json(db.members);
});

// POST add a new member
router.post('/', (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Member name is required.' });
    }

    const db = readDB();
    const exists = db.members.find(
        (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
        return res.status(409).json({ error: 'Member already exists.' });
    }

    const newMember = {
        id: uuidv4(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
    };

    db.members.push(newMember);
    writeDB(db);
    res.status(201).json(newMember);
});

// DELETE a member
router.delete('/:id', (req, res) => {
    const db = readDB();
    const index = db.members.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Member not found.' });
    }

    // Also remove expenses involving this member
    db.expenses = db.expenses.filter(
        (e) =>
            e.paidBy !== req.params.id &&
            !(e.splitAmong || []).includes(req.params.id)
    );

    db.members.splice(index, 1);
    writeDB(db);
    res.json({ message: 'Member deleted successfully.' });
});

module.exports = router;
