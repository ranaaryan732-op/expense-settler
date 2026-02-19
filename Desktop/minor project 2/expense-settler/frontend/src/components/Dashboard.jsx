import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './UI/ThemeToggle';
import MemberList from './MemberList';
import ExpenseForm from './ExpenseForm';
import DebtList from './DebtList';
import TransactionHistory from './TransactionHistory';
import MemberFilter from './MemberFilter';
import Analytics from './Analytics';
import ExportSummary from './ExportSummary';

const NAV = [
    { id: 'overview', label: 'Overview', icon: '🏠', section: 'MAIN' },
    { id: 'members', label: 'Members', icon: '👥', section: 'MAIN' },
    { id: 'expenses', label: 'Add Expense', icon: '💸', section: 'MAIN' },
    { id: 'history', label: 'History', icon: '📋', section: 'MANAGE' },
    { id: 'debts', label: 'Settle Up', icon: '⚖️', section: 'MANAGE' },
    { id: 'analytics', label: 'Analytics', icon: '📊', section: 'MANAGE' },
    { id: 'settings', label: 'Settings', icon: '⚙️', section: 'OTHER' },
];

/* Animated page wrapper */
function Page({ children }) {
    const [show, setShow] = useState(false);
    useEffect(() => { const id = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(id); }, []);
    return (
        <div style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}>
            {children}
        </div>
    );
}

/* Animated counter */
function Counter({ to, prefix = '' }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const n = parseFloat(to) || 0;
        if (n === 0) return;
        const dur = 700, start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            setVal(Math.round((1 - Math.pow(1 - p, 3)) * n));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [to]);
    return <>{prefix}{val.toLocaleString('en-IN')}</>;
}

export default function Dashboard() {
    const { members, expenses, debts, currency, changeCurrency, CURRENCIES, toggleTheme, theme } = useApp();
    const [tab, setTab] = useState('overview');
    const sym = currency?.symbol || '₹';

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const avgExpense = expenses.length ? totalSpent / expenses.length : 0;

    const sections = [...new Set(NAV.map(n => n.section))];

    return (
        <div className="app-layout">

            {/* ══ HEADER ══════════════════════════════════════════ */}
            <header className="app-header">
                <div className="app-logo">
                    {/* Logo mark */}
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <rect width="30" height="30" rx="9" fill="url(#lg1)" />
                        <text x="15" y="21" textAnchor="middle" fontSize="15" fontWeight="900" fill="white">{sym}</text>
                        <defs>
                            <linearGradient id="lg1" x1="0" y1="0" x2="30" y2="30">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    Expense Settler
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Currency */}
                    <select
                        className="form-select"
                        value={currency?.code}
                        onChange={e => changeCurrency(e.target.value)}
                        style={{ width: 'auto', padding: '0.3rem 2.2rem 0.3rem 0.65rem', fontSize: '0.78rem' }}
                    >
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                    </select>

                    <div className="frosted-pill">
                        {members.length} members · {expenses.length} expenses
                    </div>

                    <ThemeToggle />
                </div>
            </header>

            {/* ══ SIDEBAR ═════════════════════════════════════════ */}
            <aside className="app-sidebar">
                {sections.map(sec => (
                    <div key={sec}>
                        <div className="sidebar-section-label">{sec}</div>
                        <nav className="sidebar-nav">
                            {NAV.filter(n => n.section === sec).map(item => (
                                <button
                                    key={item.id}
                                    id={`nav-${item.id}`}
                                    className={`sidebar-nav-item ${tab === item.id ? 'active' : ''}`}
                                    onClick={() => setTab(item.id)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                    {item.id === 'debts' && debts.length > 0 && (
                                        <span className="nav-badge">{debts.length}</span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                ))}

                <div className="sidebar-footer">
                    <ExportSummary />
                </div>
            </aside>

            {/* ══ MAIN ════════════════════════════════════════════ */}
            <main className="app-main">

                {/* ── Overview ── */}
                {tab === 'overview' && (
                    <Page>
                        <div className="page-header">
                            <h1>Good morning 👋</h1>
                            <p>Here's your group expense snapshot</p>
                        </div>

                        {/* KPI row */}
                        <div className="stat-grid stagger" style={{ marginBottom: '2rem' }}>
                            {[
                                { label: 'Total Spent', val: totalSpent, prefix: sym, isNum: true },
                                { label: 'Members', val: members.length, isNum: false },
                                { label: 'Expenses', val: expenses.length, isNum: false },
                                { label: 'Pending Debts', val: debts.length, isNum: false },
                                { label: 'Avg Expense', val: avgExpense, prefix: sym, isNum: true },
                            ].map(s => (
                                <div className="stat-card" key={s.label}>
                                    <div className="stat-label">{s.label}</div>
                                    <div className="stat-value">
                                        {s.isNum
                                            ? <Counter to={Math.round(s.val)} prefix={s.prefix} />
                                            : <Counter to={s.val} />
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Two-col */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <DebtList />
                            <MemberList />
                        </div>
                    </Page>
                )}

                {/* ── Members ── */}
                {tab === 'members' && (
                    <Page>
                        <div className="page-header">
                            <h1>Members</h1>
                            <p>Manage the people in your group</p>
                        </div>
                        <div style={{ maxWidth: 480 }}><MemberList /></div>
                    </Page>
                )}

                {/* ── Add Expense ── */}
                {tab === 'expenses' && (
                    <Page>
                        <div className="page-header">
                            <h1>Add Expense</h1>
                            <p>Log a new shared expense for the group</p>
                        </div>
                        <div style={{ maxWidth: 560 }}><ExpenseForm /></div>
                    </Page>
                )}

                {/* ── History ── */}
                {tab === 'history' && (
                    <Page>
                        <div className="page-header">
                            <h1>Transaction History</h1>
                            <p>Search, edit, or delete any expense</p>
                        </div>
                        <MemberFilter />
                        <TransactionHistory />
                    </Page>
                )}

                {/* ── Settle Up ── */}
                {tab === 'debts' && (
                    <Page>
                        <div className="page-header">
                            <h1>Settle Up ⚖️</h1>
                            <p>Simplified transactions — mark each as settled when paid</p>
                        </div>
                        <DebtList />
                    </Page>
                )}

                {/* ── Analytics ── */}
                {tab === 'analytics' && (
                    <Page>
                        <div className="page-header">
                            <h1>Analytics 📊</h1>
                            <p>Visual breakdown of your group's spending patterns</p>
                        </div>
                        <Analytics />
                    </Page>
                )}

                {/* ── Settings ── */}
                {tab === 'settings' && (
                    <Page>
                        <div className="page-header">
                            <h1>Settings ⚙️</h1>
                            <p>Customize your experience</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 520 }} className="stagger">

                            {/* Currency */}
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>💱</span>
                                    <h3>Currency</h3>
                                </div>
                                <p style={{ marginBottom: '1rem', fontSize: '0.83rem' }}>
                                    Choose the currency symbol displayed throughout the app.
                                </p>
                                <div className="checkbox-group">
                                    {CURRENCIES.map(c => (
                                        <button key={c.code} onClick={() => changeCurrency(c.code)}
                                            className={`checkbox-chip ${currency?.code === c.code ? 'selected' : ''}`}>
                                            {c.symbol} {c.code}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme */}
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🎨</span>
                                    <h3>Appearance</h3>
                                </div>
                                <p style={{ marginBottom: '1rem', fontSize: '0.83rem' }}>Switch between dark and light mode.</p>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    {['dark', 'light'].map(t => (
                                        <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }}
                                            className={`checkbox-chip ${theme === t ? 'selected' : ''}`}
                                            style={{ padding: '0.45rem 1.25rem' }}>
                                            {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                                        </button>
                                    ))}
                                    <ThemeToggle />
                                </div>
                            </div>

                            {/* Export */}
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>📤</span>
                                    <h3>Export Data</h3>
                                </div>
                                <p style={{ marginBottom: '1rem', fontSize: '0.83rem' }}>
                                    Download or copy a full text summary of all expenses and settlements.
                                </p>
                                <ExportSummary />
                            </div>

                            {/* About */}
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                                    <h3>About</h3>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.8 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Expense Settler v2.0</div>
                                    <div>Split bills and settle debts effortlessly among friends.</div>
                                    <div style={{ marginTop: '0.5rem', color: 'var(--text-3)', fontSize: '0.78rem' }}>
                                        React 18 · Vite 5 · Express · JSON
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Page>
                )}
            </main>
        </div>
    );
}
