import React from 'react';
import { useDebts } from '../hooks/useDebts';
import { useApp } from '../context/AppContext';
import Card from './UI/Card';

export default function DebtList() {
    const { debts, balances, loading, refetch } = useDebts();
    const { members, settleDebt, isDebtSettled, clearSettledDebts, currency } = useApp();
    const sym = currency?.symbol || '₹';

    const unsettled = debts.filter(d => !isDebtSettled(d.from, d.to));
    const settled = debts.filter(d => isDebtSettled(d.from, d.to));

    return (
        <Card
            title="Settlements"
            icon="⚖️"
            action={
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {settled.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={clearSettledDebts}>🗑️ Clear</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={refetch}>🔄</button>
                </div>
            }
        >
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem' }}>
                    <div className="spinner" />
                </div>
            ) : debts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎉</div>
                    <div className="empty-title">All settled up!</div>
                    <div className="empty-desc">
                        {members.length === 0 ? 'Add members and expenses to see who owes what' : 'No outstanding debts'}
                    </div>
                </div>
            ) : (
                <>
                    {/* Unsettled */}
                    {unsettled.length > 0 && (
                        <div className="stagger" style={{ marginBottom: '0.75rem' }}>
                            {unsettled.map((d, i) => (
                                <div key={i} className="debt-row">
                                    {/* From */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                        <div className="avatar avatar-sm" style={{ background: 'var(--grad-danger)' }}>
                                            {d.fromName[0].toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {d.fromName}
                                        </span>
                                    </div>

                                    <span className="debt-arrow-icon">→</span>

                                    {/* To */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                        <div className="avatar avatar-sm" style={{ background: 'var(--grad-success)' }}>
                                            {d.toName[0].toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {d.toName}
                                        </span>
                                    </div>

                                    <div className="debt-amount" style={{ marginLeft: 'auto' }}>
                                        {sym}{d.amount.toFixed(2)}
                                    </div>

                                    <button
                                        onClick={() => settleDebt(d.from, d.to)}
                                        style={{
                                            flexShrink: 0,
                                            padding: '0.3rem 0.7rem',
                                            borderRadius: 'var(--r-full)',
                                            border: '1px solid rgba(16,185,129,0.4)',
                                            background: 'rgba(16,185,129,0.1)',
                                            color: 'var(--success)',
                                            fontSize: '0.72rem', fontWeight: 700,
                                            cursor: 'pointer', fontFamily: 'var(--font)',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.22)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
                                    >
                                        ✓ Settle
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Settled */}
                    {settled.length > 0 && (
                        <>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                                ✅ Settled
                            </div>
                            {settled.map((d, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(16,185,129,0.05)',
                                    border: '1px solid rgba(16,185,129,0.18)',
                                    borderRadius: 'var(--r-lg)',
                                    marginBottom: '0.4rem',
                                    opacity: 0.6,
                                }}>
                                    <span style={{ fontSize: '0.83rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-3)', flex: 1 }}>
                                        {d.fromName} → {d.toName}
                                    </span>
                                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.875rem' }}>
                                        {sym}{d.amount.toFixed(2)}
                                    </span>
                                    <button onClick={() => settleDebt(d.from, d.to)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '0.8rem' }}>
                                        ↩️
                                    </button>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Net balances */}
                    {balances.length > 0 && (
                        <>
                            <div className="divider" />
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>
                                Net Balances
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {balances.map(b => (
                                    <div key={b.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: 'var(--r-full)',
                                        background: 'var(--bg-elevated)',
                                        border: `1px solid ${b.net >= 0 ? 'rgba(16,185,129,0.28)' : 'rgba(244,63,94,0.28)'}`,
                                        fontSize: '0.78rem',
                                    }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{b.name}</span>
                                        <span style={{ fontWeight: 800, color: b.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                            {b.net >= 0 ? '+' : ''}{sym}{b.net.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </Card>
    );
}
