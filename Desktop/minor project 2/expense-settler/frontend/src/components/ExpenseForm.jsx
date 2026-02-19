import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from './UI/Card';

const CATEGORIES = [
    { name: 'General', icon: '📦' },
    { name: 'Food', icon: '🍔' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Accommodation', icon: '🏨' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Other', icon: '🔖' },
];

const DEFAULT_FORM = {
    title: '', amount: '', paidBy: '', splitAmong: [], category: 'General',
    date: new Date().toISOString().split('T')[0],
};

export default function ExpenseForm() {
    const { members, addExpense, currency } = useApp();
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const sym = currency?.symbol || '₹';

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const toggleSplit = (id) =>
        set('splitAmong', form.splitAmong.includes(id)
            ? form.splitAmong.filter(x => x !== id)
            : [...form.splitAmong, id]);

    const selectAll = () => set('splitAmong', members.map(m => m.id));
    const clearAll = () => set('splitAmong', []);

    const isValid = form.title && parseFloat(form.amount) > 0 && form.paidBy && form.splitAmong.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;
        setSubmitting(true);
        const result = await addExpense({
            ...form,
            amount: parseFloat(form.amount),
            date: new Date(form.date).toISOString(),
        });
        setSubmitting(false);
        if (result) {
            setSuccess(true);
            setForm(DEFAULT_FORM);
            setTimeout(() => setSuccess(false), 2500);
        }
    };

    if (members.length === 0) {
        return (
            <Card title="Add Expense" icon="💸">
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No members yet</div>
                    <div className="empty-state-desc">Add at least one member before logging expenses</div>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Add Expense" icon="💸">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Title */}
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                        id="expense-title"
                        className="form-input"
                        placeholder="e.g. Dinner at restaurant"
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        maxLength={80}
                        required
                    />
                </div>

                {/* Amount + Category */}
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Amount ({sym})</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.95rem',
                                pointerEvents: 'none',
                            }}>{sym}</span>
                            <input
                                id="expense-amount"
                                className="form-input"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => set('amount', e.target.value)}
                                required
                                style={{ paddingLeft: '1.75rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            id="expense-date"
                            className="form-input"
                            type="date"
                            value={form.date}
                            onChange={e => set('date', e.target.value)}
                        />
                    </div>
                </div>

                {/* Category pills */}
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {CATEGORIES.map(c => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => set('category', c.name)}
                                className={`checkbox-chip ${form.category === c.name ? 'selected' : ''}`}
                                style={{ fontSize: '0.8rem' }}
                            >
                                {c.icon} {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Paid By */}
                <div className="form-group">
                    <label className="form-label">Paid By</label>
                    <select
                        id="expense-paidby"
                        className="form-select"
                        value={form.paidBy}
                        onChange={e => set('paidBy', e.target.value)}
                        required
                    >
                        <option value="">Select who paid…</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>

                {/* Split Among */}
                <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Split Among</label>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={selectAll} style={{ fontSize: '0.72rem' }}>All</button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll} style={{ fontSize: '0.72rem' }}>None</button>
                        </div>
                    </div>
                    <div className="checkbox-group">
                        {members.map(m => (
                            <label key={m.id} className={`checkbox-chip ${form.splitAmong.includes(m.id) ? 'selected' : ''}`}>
                                <input type="checkbox" checked={form.splitAmong.includes(m.id)} onChange={() => toggleSplit(m.id)} />
                                {m.name}
                            </label>
                        ))}
                    </div>
                    {form.splitAmong.length > 0 && form.amount && (
                        <div style={{
                            marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-secondary)',
                            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem',
                        }}>
                            ÷ {sym}{(parseFloat(form.amount) / form.splitAmong.length).toFixed(2)} per person
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isValid || submitting}
                    style={{
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: success
                            ? 'linear-gradient(135deg,#10b981,#059669)'
                            : isValid
                                ? 'linear-gradient(135deg,#7c3aed,#06b6d4)'
                                : 'var(--bg-elevated)',
                        boxShadow: success
                            ? '0 8px 28px rgba(16,185,129,0.5)'
                            : isValid
                                ? '0 8px 28px rgba(124,58,237,0.45)'
                                : 'none',
                        transform: isValid && !submitting ? 'translateY(0)' : 'translateY(0)',
                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        letterSpacing: '-0.01em',
                        position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => { if (isValid && !submitting) e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
                    onMouseDown={e => { if (isValid && !submitting) e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
                >
                    {submitting
                        ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Adding…</>
                        : success
                            ? '✅ Expense Added!'
                            : '💸 Add Expense'
                    }
                </button>
            </form>
        </Card>
    );
}
