import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['General', 'Food', 'Travel', 'Accommodation', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

export default function EditExpenseModal({ expense, onClose }) {
    const { members, updateExpense, currency } = useApp();
    const sym = currency?.symbol || '₹';
    const [form, setForm] = useState({
        title: expense.title,
        amount: expense.amount,
        paidBy: expense.paidBy,
        splitAmong: expense.splitAmong || [],
        category: expense.category || 'General',
        date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleSplit = id =>
        set('splitAmong', form.splitAmong.includes(id)
            ? form.splitAmong.filter(x => x !== id)
            : [...form.splitAmong, id]);

    const isValid = form.title && parseFloat(form.amount) > 0 && form.paidBy && form.splitAmong.length > 0;

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        await updateExpense(expense.id, {
            ...form,
            amount: parseFloat(form.amount),
            date: new Date(form.date).toISOString(),
        });
        setSaving(false);
        onClose();
    };

    return (
        /* Backdrop */
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-2)',
                    borderRadius: 'var(--r-2xl)',
                    padding: '1.75rem',
                    width: '100%', maxWidth: 520,
                    boxShadow: 'var(--shadow-lg), var(--shadow-brand)',
                    animation: 'modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '0.15rem' }}>✏️ Edit Expense</h3>
                        <p style={{ fontSize: '0.8rem' }}>Update the details below</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-2)',
                            borderRadius: 'var(--r-md)', width: 34, height: 34,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                    >✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input className="form-input" value={form.title}
                            onChange={e => set('title', e.target.value)} maxLength={80} required />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Amount ({sym})</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--brand)', pointerEvents: 'none' }}>{sym}</span>
                                <input className="form-input" type="number" min="0.01" step="0.01"
                                    value={form.amount} onChange={e => set('amount', e.target.value)}
                                    required style={{ paddingLeft: '1.75rem' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Paid By</label>
                        <select className="form-select" value={form.paidBy} onChange={e => set('paidBy', e.target.value)} required>
                            <option value="">Select…</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Split Among</label>
                        <div className="checkbox-group">
                            {members.map(m => (
                                <label key={m.id} className={`checkbox-chip ${form.splitAmong.includes(m.id) ? 'selected' : ''}`}>
                                    <input type="checkbox" checked={form.splitAmong.includes(m.id)} onChange={() => toggleSplit(m.id)} />
                                    {m.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
                        <button type="button" className="btn btn-secondary w-full" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary w-full" disabled={!isValid || saving}>
                            {saving
                                ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Saving…</>
                                : '💾 Save Changes'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
