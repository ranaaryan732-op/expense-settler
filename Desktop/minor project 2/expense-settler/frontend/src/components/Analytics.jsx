import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from './UI/Card';

const CATEGORY_COLORS = {
    Food: '#f59e0b',
    Travel: '#06b6d4',
    Accommodation: '#8b5cf6',
    Entertainment: '#ec4899',
    Shopping: '#10b981',
    Utilities: '#f43f5e',
    General: '#7c3aed',
    Other: '#94a3b8',
};

const CATEGORY_ICONS = {
    Food: '🍔', Travel: '✈️', Accommodation: '🏨',
    Entertainment: '🎬', Shopping: '🛍️', Utilities: '💡',
    General: '📦', Other: '🔖',
};

export default function Analytics() {
    const { expenses, members, currency } = useApp();
    const sym = currency?.symbol || '₹';

    /* ── Category totals ── */
    const categoryData = useMemo(() => {
        const map = {};
        expenses.forEach(e => {
            map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.entries(map)
            .map(([cat, total]) => ({ cat, total }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);

    const maxCat = categoryData[0]?.total || 1;

    /* ── Per-member spending ── */
    const memberSpend = useMemo(() => {
        const map = {};
        members.forEach(m => { map[m.id] = { name: m.name, paid: 0, share: 0 }; });
        expenses.forEach(e => {
            if (map[e.paidBy]) map[e.paidBy].paid += e.amount;
            const share = e.amount / (e.splitAmong?.length || 1);
            (e.splitAmong || []).forEach(id => {
                if (map[id]) map[id].share += share;
            });
        });
        return Object.values(map).sort((a, b) => b.paid - a.paid);
    }, [expenses, members]);

    const maxPaid = memberSpend[0]?.paid || 1;

    /* ── Monthly timeline ── */
    const monthlyData = useMemo(() => {
        const map = {};
        expenses.forEach(e => {
            const key = new Date(e.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            map[key] = (map[key] || 0) + e.amount;
        });
        return Object.entries(map).slice(-6).map(([month, total]) => ({ month, total }));
    }, [expenses]);

    const maxMonth = Math.max(...monthlyData.map(m => m.total), 1);

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const avgExpense = expenses.length ? totalSpent / expenses.length : 0;

    if (expenses.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '4rem' }}>
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">No data yet</div>
                <div className="empty-state-desc">Add some expenses to see analytics</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Summary KPIs ── */}
            <div className="stat-grid">
                {[
                    { label: 'Total Spent', value: `${sym}${totalSpent.toLocaleString('en-IN')}` },
                    { label: 'Avg Expense', value: `${sym}${avgExpense.toFixed(0)}` },
                    { label: 'Transactions', value: expenses.length },
                    { label: 'Categories', value: categoryData.length },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* ── Category Breakdown ── */}
                <Card title="Spending by Category" icon="🗂️">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {categoryData.map(({ cat, total }) => (
                            <div key={cat}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                                        {CATEGORY_ICONS[cat] || '📦'} {cat}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                                        {sym}{total.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(total / maxCat) * 100}%`,
                                        background: CATEGORY_COLORS[cat] || '#7c3aed',
                                        borderRadius: 99,
                                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                                    }} />
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    {((total / totalSpent) * 100).toFixed(1)}% of total
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ── Per-Member Spending ── */}
                <Card title="Member Spending" icon="👤">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {memberSpend.map((m, i) => (
                            <div key={m.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        Paid {sym}{m.paid.toLocaleString('en-IN')} · Owes {sym}{m.share.toFixed(0)}
                                    </span>
                                </div>
                                {/* Paid bar */}
                                <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 99, overflow: 'hidden', marginBottom: 3 }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(m.paid / maxPaid) * 100}%`,
                                        background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
                                        borderRadius: 99,
                                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                                    }} />
                                </div>
                                {/* Share bar */}
                                <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(m.share / maxPaid) * 100}%`,
                                        background: 'rgba(244,63,94,0.6)',
                                        borderRadius: 99,
                                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                                    }} />
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 4, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', borderRadius: 99, display: 'inline-block' }} />
                                Paid
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 4, background: 'rgba(244,63,94,0.6)', borderRadius: 99, display: 'inline-block' }} />
                                Share owed
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Monthly Timeline ── */}
            {monthlyData.length > 0 && (
                <Card title="Monthly Spending (last 6 months)" icon="📅">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 140, padding: '0 0.5rem' }}>
                        {monthlyData.map(({ month, total }) => (
                            <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                    {sym}{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
                                </span>
                                <div style={{
                                    width: '100%',
                                    height: `${(total / maxMonth) * 100}px`,
                                    minHeight: 4,
                                    background: 'linear-gradient(180deg,#7c3aed,#06b6d4)',
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)',
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(180deg,rgba(255,255,255,0.15),transparent)',
                                        borderRadius: '6px 6px 0 0',
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{month}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* ── Donut-style category visual ── */}
            <Card title="Category Share" icon="🍩">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {categoryData.map(({ cat, total }) => {
                        const pct = ((total / totalSpent) * 100).toFixed(1);
                        return (
                            <div key={cat} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 0.875rem',
                                background: `${CATEGORY_COLORS[cat]}18`,
                                border: `1px solid ${CATEGORY_COLORS[cat]}44`,
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.8rem',
                            }}>
                                <span>{CATEGORY_ICONS[cat]}</span>
                                <span style={{ fontWeight: 600, color: CATEGORY_COLORS[cat] }}>{cat}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
