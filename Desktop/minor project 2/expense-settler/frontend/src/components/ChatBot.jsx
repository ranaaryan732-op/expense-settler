import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

/* ── Smart reply engine ─────────────────────────────────── */
function getBotReply(input, { members, expenses, debts, balances, currency }) {
    const q = input.toLowerCase().trim();
    const sym = currency?.symbol || '₹';

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const memberNames = members.map((m) => m.name).join(', ');

    // Greetings
    if (/^(hi|hello|hey|sup|yo)\b/.test(q))
        return `Hey there! 👋 I'm your Expense Assistant. Ask me things like:\n• "Who owes the most?"\n• "How much did we spend?"\n• "What are the debts?"`;

    // Total spent
    if (q.includes('total') || q.includes('spent') || q.includes('spend'))
        return `💰 Total group spending is **${sym}${totalSpent.toLocaleString('en-IN')}** across **${expenses.length}** expense${expenses.length !== 1 ? 's' : ''}.`;

    // Members
    if (q.includes('member') || (q.includes('who') && q.includes('group')))
        return members.length === 0
            ? `No members added yet. Go to the Members tab to add people!`
            : `👥 Group members (${members.length}): **${memberNames}**`;

    // Debts / settlements
    if (q.includes('debt') || q.includes('owe') || q.includes('settle') || q.includes('settlement')) {
        if (debts.length === 0)
            return `🎉 Great news! Everyone is **settled up** — no outstanding debts.`;
        const lines = debts.map((d) => `• **${d.fromName}** owes **${d.toName}** → ${sym}${d.amount.toFixed(2)}`);
        return `⚖️ Here are the simplified settlements:\n${lines.join('\n')}`;
    }

    // Balances
    if (q.includes('balance') || q.includes('net')) {
        if (balances.length === 0) return `No balance data yet. Add some expenses first!`;
        const lines = balances.map((b) =>
            `• **${b.name}**: ${b.net >= 0 ? '+' : ''}${sym}${b.net.toFixed(2)} ${b.net >= 0 ? '(gets back)' : '(owes)'}`
        );
        return `📊 Net balances:\n${lines.join('\n')}`;
    }

    // Biggest expense
    if (q.includes('biggest') || q.includes('largest') || q.includes('most expensive')) {
        if (expenses.length === 0) return `No expenses recorded yet.`;
        const top = [...expenses].sort((a, b) => b.amount - a.amount)[0];
        const payer = members.find((m) => m.id === top.paidBy)?.name || 'Unknown';
        return `🏆 Biggest expense: **${top.title}** — ${sym}${top.amount.toLocaleString('en-IN')} paid by **${payer}**`;
    }

    // Who paid the most
    if (q.includes('paid') && (q.includes('most') || q.includes('max'))) {
        if (expenses.length === 0) return `No expenses yet!`;
        const paid = {};
        expenses.forEach((e) => { paid[e.paidBy] = (paid[e.paidBy] || 0) + e.amount; });
        const topId = Object.entries(paid).sort((a, b) => b[1] - a[1])[0];
        const name = members.find((m) => m.id === topId[0])?.name || 'Unknown';
        return `💳 **${name}** has paid the most — ${sym}${topId[1].toLocaleString('en-IN')} total.`;
    }

    // Expense count
    if (q.includes('how many') && q.includes('expense'))
        return `📋 There are **${expenses.length}** expense${expenses.length !== 1 ? 's' : ''} recorded.`;

    // Average
    if (q.includes('average') || q.includes('avg'))
        return expenses.length === 0
            ? `No expenses to average yet.`
            : `📐 Average expense: **${sym}${(totalSpent / expenses.length).toFixed(2)}**`;

    // Categories
    if (q.includes('categor')) {
        if (expenses.length === 0) return `No expenses yet to categorize.`;
        const cats = {};
        expenses.forEach((e) => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
        const lines = Object.entries(cats)
            .sort((a, b) => b[1] - a[1])
            .map(([c, a]) => `• ${c}: ${sym}${a.toLocaleString('en-IN')}`);
        return `🗂️ Spending by category:\n${lines.join('\n')}`;
    }

    // Help
    if (q.includes('help') || q.includes('what can you'))
        return `🤖 I can answer:\n• Total / average spending\n• Who owes whom\n• Net balances\n• Biggest expense\n• Who paid the most\n• Spending by category\n• Member list`;

    return `🤔 I'm not sure about that. Try asking:\n• "What are the debts?"\n• "Who paid the most?"\n• "Show balances"\n• "Total spent"`;
}

const SUGGESTIONS = [
    'What are the debts?',
    'Total spent',
    'Who paid the most?',
    'Show balances',
    'Biggest expense',
    'Spending by category',
];

/* ── Component ──────────────────────────────────────────── */
export default function ChatBot() {
    const appData = useApp();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            from: 'bot',
            text: "Hi! I'm your Expense Assistant 🤖\nAsk me anything about your group expenses!",
        },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    const sendMessage = (text) => {
        const userText = text || input.trim();
        if (!userText) return;
        setInput('');

        const userMsg = { id: Date.now(), from: 'user', text: userText };
        setMessages((prev) => [...prev, userMsg]);
        setTyping(true);

        setTimeout(() => {
            const reply = getBotReply(userText, appData);
            setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: reply }]);
            setTyping(false);
        }, 600);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    /* Render markdown-like bold (**text**) */
    const renderText = (text) =>
        text.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
                <span key={i}>
                    {parts.map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                    {i < text.split('\n').length - 1 && <br />}
                </span>
            );
        });

    return (
        <>
            {/* ── Floating Button ── */}
            <button
                id="chatbot-toggle"
                onClick={() => setOpen((o) => !o)}
                aria-label="Open chat assistant"
                style={{
                    position: 'fixed',
                    bottom: '1.75rem',
                    right: '1.75rem',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.55)',
                    zIndex: 1000,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    animation: 'pulse-glow 3s ease-in-out infinite',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.12)';
                    e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,58,237,0.75)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.55)';
                }}
            >
                {open ? '✕' : '🤖'}
            </button>

            {/* ── Chat Panel ── */}
            <div
                id="chatbot-panel"
                style={{
                    position: 'fixed',
                    bottom: '5.5rem',
                    right: '1.75rem',
                    width: 340,
                    maxHeight: 520,
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 999,
                    transition: 'opacity 0.25s ease, transform 0.25s ease',
                    opacity: open ? 1 : 0,
                    transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
                    pointerEvents: open ? 'all' : 'none',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '0.875rem 1.125rem',
                    background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>🤖</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Expense Assistant</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>
                            Ask me about your expenses
                        </div>
                    </div>
                    <div style={{
                        marginLeft: 'auto',
                        width: 8, height: 8,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 6px #10b981',
                    }} />
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={{
                                maxWidth: '82%',
                                padding: '0.6rem 0.875rem',
                                borderRadius: msg.from === 'user'
                                    ? '16px 16px 4px 16px'
                                    : '16px 16px 16px 4px',
                                background: msg.from === 'user'
                                    ? 'linear-gradient(135deg,#7c3aed,#06b6d4)'
                                    : 'var(--bg-elevated)',
                                color: msg.from === 'user' ? '#fff' : 'var(--text-primary)',
                                fontSize: '0.82rem',
                                lineHeight: 1.55,
                                border: msg.from === 'bot' ? '1px solid var(--border-subtle)' : 'none',
                                animation: 'fadeIn 0.2s ease',
                            }}>
                                {renderText(msg.text)}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {typing && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{
                                padding: '0.6rem 0.875rem',
                                borderRadius: '16px 16px 16px 4px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}>
                                {[0, 1, 2].map((i) => (
                                    <span key={i} style={{
                                        width: 6, height: 6,
                                        borderRadius: '50%',
                                        background: 'var(--accent-primary)',
                                        display: 'inline-block',
                                        animation: `bounce 1s ease ${i * 0.15}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 2 && (
                    <div style={{
                        padding: '0 0.875rem 0.5rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.375rem',
                    }}>
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => sendMessage(s)}
                                style={{
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(124,58,237,0.12)',
                                    border: '1px solid rgba(124,58,237,0.3)',
                                    color: 'var(--accent-primary)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    fontFamily: 'var(--font-sans)',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.25)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.12)')}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{
                    padding: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    gap: '0.5rem',
                }}>
                    <input
                        ref={inputRef}
                        id="chatbot-input"
                        className="form-input"
                        placeholder="Ask something…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        style={{
                            width: 36, height: 36,
                            borderRadius: 'var(--radius-md)',
                            background: input.trim()
                                ? 'linear-gradient(135deg,#7c3aed,#06b6d4)'
                                : 'var(--bg-elevated)',
                            border: 'none',
                            cursor: input.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        ➤
                    </button>
                </div>
            </div>

            {/* Bounce keyframes injected once */}
            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
        </>
    );
}
