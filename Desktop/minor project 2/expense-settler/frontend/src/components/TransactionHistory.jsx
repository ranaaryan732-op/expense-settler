import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from './UI/Card';
import EditExpenseModal from './EditExpenseModal';

const CAT_ICONS = {
    Food: '🍔', Travel: '✈️', Accommodation: '🏨',
    Entertainment: '🎬', Shopping: '🛍️', Utilities: '💡',
    General: '📦', Other: '🔖',
};

const CAT_COLORS = {
    Food: '#f59e0b', Travel: '#06b6d4', Accommodation: '#8b5cf6',
    Entertainment: '#ec4899', Shopping: '#10b981', Utilities: '#f43f5e',
    General: '#7c3aed', Other: '#94a3b8',
};

export default function TransactionHistory() {
    const { expenses, members, deleteExpense, loading, searchQuery, setSearchQuery, currency } = useApp();
    const [editTarget, setEditTarget] = useState(null);
    const sym = currency?.symbol || '₹';

    const getName = id => members.find(m => m.id === id)?.name || 'Unknown';

    const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        if (!q) return expenses;
        return expenses.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.category?.toLowerCase().includes(q) ||
            getName(e.paidBy).toLowerCase().includes(q)
        );
    }, [expenses, searchQuery, members]);

    return (
        <>
            {editTarget && <EditExpenseModal expense={editTarget} onClose={() => setEditTarget(null)} />}

            <Card
                title="Transactions"
                icon="📋"
                action={
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>
                        {filtered.length} / {expenses.length}
                    </span>
                }
            >
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.125rem' }}>
                    <span style={{
                        position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '0.85rem', pointerEvents: 'none', opacity: 0.4,
                    }}>🔍</span>
                    <input
                        id="expense-search"
                        className="form-input"
                        placeholder="Search title, category or payer…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.25rem', paddingRight: searchQuery ? '2.25rem' : undefined }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{
                            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-3)', fontSize: '0.85rem', lineHeight: 1,
                        }}>✕</button>
                    )}
                </div>

                {/* List */}
                {loading.expenses ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem' }}>
                        <div className="spinner" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">{searchQuery ? '🔍' : '📭'}</div>
                        <div className="empty-title">{searchQuery ? 'No results' : 'No expenses yet'}</div>
                        <div className="empty-desc">
                            {searchQuery ? `Nothing matched "${searchQuery}"` : 'Add your first expense to get started'}
                        </div>
                    </div>
                ) : (
                    <div className="stagger">
                        {filtered.map(exp => {
                            const color = CAT_COLORS[exp.category] || '#7c3aed';
                            const splitNames = (exp.splitAmong || []).map(getName).join(', ');
                            return (
                                <div key={exp.id} className="list-item">
                                    {/* Category icon */}
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 'var(--r-md)',
                                        background: `${color}18`,
                                        border: `1px solid ${color}33`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', flexShrink: 0,
                                    }}>
                                        {CAT_ICONS[exp.category] || '📦'}
                                    </div>

                                    {/* Info */}
                                    <div className="list-item-content">
                                        <div className="list-item-title">{exp.title}</div>
                                        <div className="list-item-subtitle">
                                            <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{getName(exp.paidBy)}</span>
                                            {' · '}Split: {splitNames}
                                        </div>
                                        <div className="list-item-subtitle">{fmtDate(exp.date)}</div>
                                    </div>

                                    {/* Amount + badge */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)' }}>
                                            {sym}{exp.amount.toLocaleString('en-IN')}
                                        </span>
                                        <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                                            {exp.category}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0 }}>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => setEditTarget(exp)}
                                            title="Edit"
                                            style={{ fontSize: '0.85rem' }}
                                        >✏️</button>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={() => deleteExpense(exp.id)}
                                            title="Delete"
                                            style={{ fontSize: '0.85rem', color: 'var(--danger)' }}
                                        >🗑️</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </>
    );
}
