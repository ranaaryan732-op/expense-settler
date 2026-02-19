import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AppContext = createContext(null);
const API = import.meta.env.VITE_API_URL || '/api';

export const CURRENCIES = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

export function AppProvider({ children }) {
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [debts, setDebts] = useState([]);
    const [balances, setBalances] = useState([]);
    const [settledDebts, setSettledDebts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('settledDebts') || '[]'); } catch { return []; }
    });
    const [loading, setLoading] = useState({ members: false, expenses: false, debts: false });
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [filterMember, setFilterMember] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem('currency');
        return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
    });

    // ── Theme ─────────────────────────────────────────────────
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    // ── Currency ──────────────────────────────────────────────
    const changeCurrency = (code) => {
        const cur = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
        setCurrency(cur);
        localStorage.setItem('currency', code);
        toast.success(`Currency set to ${cur.symbol} ${cur.code}`);
    };

    // ── Members ───────────────────────────────────────────────
    const fetchMembers = useCallback(async () => {
        setLoading(l => ({ ...l, members: true }));
        try {
            const { data } = await axios.get(`${API}/members`);
            setMembers(data);
        } catch { toast.error('Failed to load members'); }
        finally { setLoading(l => ({ ...l, members: false })); }
    }, []);

    const addMember = async (name) => {
        try {
            const { data } = await axios.post(`${API}/members`, { name });
            setMembers(prev => [...prev, data]);
            toast.success(`${data.name} added!`);
            return data;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add member');
            return null;
        }
    };

    const deleteMember = async (id) => {
        try {
            await axios.delete(`${API}/members/${id}`);
            setMembers(prev => prev.filter(m => m.id !== id));
            fetchExpenses();
            fetchDebts();
            toast.success('Member removed');
        } catch { toast.error('Failed to remove member'); }
    };

    // ── Expenses ──────────────────────────────────────────────
    const fetchExpenses = useCallback(async (memberId = '') => {
        setLoading(l => ({ ...l, expenses: true }));
        try {
            const url = memberId ? `${API}/expenses?memberId=${memberId}` : `${API}/expenses`;
            const { data } = await axios.get(url);
            setExpenses(data);
        } catch { toast.error('Failed to load expenses'); }
        finally { setLoading(l => ({ ...l, expenses: false })); }
    }, []);

    const addExpense = async (expenseData) => {
        try {
            const { data } = await axios.post(`${API}/expenses`, expenseData);
            setExpenses(prev => [data, ...prev]);
            fetchDebts();
            toast.success('Expense added!');
            return data;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add expense');
            return null;
        }
    };

    const updateExpense = async (id, expenseData) => {
        try {
            const { data } = await axios.put(`${API}/expenses/${id}`, expenseData);
            setExpenses(prev => prev.map(e => e.id === id ? data : e));
            fetchDebts();
            toast.success('Expense updated!');
            return data;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update expense');
            return null;
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axios.delete(`${API}/expenses/${id}`);
            setExpenses(prev => prev.filter(e => e.id !== id));
            fetchDebts();
            toast.success('Expense deleted');
        } catch { toast.error('Failed to delete expense'); }
    };

    // ── Debts ─────────────────────────────────────────────────
    const fetchDebts = useCallback(async () => {
        setLoading(l => ({ ...l, debts: true }));
        try {
            const [debtsRes, balancesRes] = await Promise.all([
                axios.get(`${API}/debts`),
                axios.get(`${API}/debts/balances`),
            ]);
            setDebts(debtsRes.data);
            setBalances(balancesRes.data);
        } catch { toast.error('Failed to load debts'); }
        finally { setLoading(l => ({ ...l, debts: false })); }
    }, []);

    // Mark a debt as settled (client-side only — stored in localStorage)
    const settleDebt = (from, to) => {
        const key = `${from}→${to}`;
        setSettledDebts(prev => {
            const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
            localStorage.setItem('settledDebts', JSON.stringify(next));
            return next;
        });
        toast.success('Debt marked as settled ✅');
    };

    const isDebtSettled = (from, to) => settledDebts.includes(`${from}→${to}`);

    const clearSettledDebts = () => {
        setSettledDebts([]);
        localStorage.removeItem('settledDebts');
        toast.success('Cleared all settled marks');
    };

    // ── Initial load ──────────────────────────────────────────
    useEffect(() => {
        fetchMembers();
        fetchExpenses();
        fetchDebts();
    }, [fetchMembers, fetchExpenses, fetchDebts]);

    useEffect(() => {
        fetchExpenses(filterMember);
    }, [filterMember, fetchExpenses]);

    const value = {
        members, expenses, debts, balances, loading,
        theme, toggleTheme,
        currency, changeCurrency, CURRENCIES,
        filterMember, setFilterMember,
        searchQuery, setSearchQuery,
        settledDebts, settleDebt, isDebtSettled, clearSettledDebts,
        addMember, deleteMember,
        addExpense, updateExpense, deleteExpense,
        fetchDebts,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
