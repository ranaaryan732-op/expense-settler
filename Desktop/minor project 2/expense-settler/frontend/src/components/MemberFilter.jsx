import React from 'react';
import { useApp } from '../context/AppContext';

export default function MemberFilter() {
    const { members, filterMember, setFilterMember } = useApp();
    if (members.length === 0) return null;

    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1.125rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-1)',
                borderRadius: 'var(--r-lg)',
                marginBottom: '1rem',
            }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', flexShrink: 0 }}>
                    Filter
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <button
                        className={`checkbox-chip ${filterMember === '' ? 'selected' : ''}`}
                        onClick={() => setFilterMember('')}
                    >
                        🌐 All
                    </button>
                    {members.map(m => (
                        <button
                            key={m.id}
                            className={`checkbox-chip ${filterMember === m.id ? 'selected' : ''}`}
                            onClick={() => setFilterMember(filterMember === m.id ? '' : m.id)}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
