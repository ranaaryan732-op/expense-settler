const express = require('express');
const cors = require('cors');
const path = require('path');

const membersRouter = require('./routes/members');
const expensesRouter = require('./routes/expenses');
const debtsRouter = require('./routes/debts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Routes
app.use('/api/members', membersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/debts', debtsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Expense Settler API is running 🚀', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
