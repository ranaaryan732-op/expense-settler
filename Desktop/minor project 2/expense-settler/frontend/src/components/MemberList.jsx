import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from './UI/Card';
import Button from './UI/Button';

const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#7c3aed,#06b6d4)',
    'linear-gradient(135deg,#f43f5e,#f59e0b)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#f59e0b,#10b981)',
    'linear-gradient(135deg,#06b6d4,#7c3aed)',
];

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function MemberList() {
    const { members, addMember, deleteMember, loading } = useApp();
    const [name, setName] = useState('');
    const [adding, setAdding] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        setAdding(true);
        await addMember(trimmed);
        setName('');
        setAdding(false);
    };

    return (
        <Card title="Members" icon="👥" action={
            <span className="frosted-pill">{members.length} people</span>
        }>
            {/* Add form */}
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        id="add-member-input"
                        className="form-input"
                        placeholder="Enter name…"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        maxLength={40}
                        style={{
                            paddingLeft: '2.5rem',
                            boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.1)' : undefined,
                        }}
                    />
                    <span style={{
                        position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '1rem', pointerEvents: 'none',
                        transition: 'opacity 0.2s',
                        opacity: focused || name ? 1 : 0.4,
                    }}>👤</span>
                </div>
                <Button type="submit" variant="primary" size="sm" loading={adding} disabled={!name.trim() || adding}>
                    {adding ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '+ Add'}
                </Button>
            </form>

            {/* Member list */}
            {loading.members ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div className="spinner" />
                </div>
            ) : members.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No members yet</div>
                    <div className="empty-state-desc">Add people to start splitting expenses</div>
                </div>
            ) : (
                <div className="stagger-children">
                    {members.map((member, idx) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            gradient={AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]}
                            onDelete={() => deleteMember(member.id)}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

function MemberRow({ member, gradient, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleDelete = () => {
        if (!confirming) { setConfirming(true); return; }
        onDelete();
    };

    return (
        <div
            className="list-item"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setConfirming(false); }}
        >
            {/* Avatar */}
            <div style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 800, color: '#fff',
                flexShrink: 0,
                boxShadow: hovered ? `0 6px 20px rgba(124,58,237,0.5)` : '0 4px 12px rgba(124,58,237,0.3)',
                transform: hovered ? 'scale(1.12) rotate(-3deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
                {getInitials(member.name)}
            </div>

            <div className="list-item-content">
                <div className="list-item-title">{member.name}</div>
                <div className="list-item-subtitle">
                    {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
            </div>

            {/* Delete button */}
            <button
                onClick={handleDelete}
                title={confirming ? 'Click again to confirm' : 'Remove member'}
                style={{
                    background: confirming ? 'rgba(244,63,94,0.2)' : 'transparent',
                    border: `1px solid ${confirming ? 'rgba(244,63,94,0.5)' : 'transparent'}`,
                    borderRadius: 'var(--radius-sm)',
                    color: confirming ? 'var(--accent-danger)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? 'scale(1)' : 'scale(0.8)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                }}
            >
                {confirming ? '⚠️ Sure?' : '🗑️'}
            </button>
        </div>
    );
}
