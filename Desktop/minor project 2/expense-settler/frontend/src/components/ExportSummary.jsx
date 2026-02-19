import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function ExportSummary() {
    const { members, expenses, debts, balances, currency } = useApp();
    const [copied, setCopied] = useState(false);
    const sym = currency?.symbol || '₹';

    const buildText = () => {
        const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
        const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const lines = [
            `╔══════════════════════════════════════╗`,
            `║       EXPENSE SETTLER SUMMARY        ║`,
            `╚══════════════════════════════════════╝`,
            `Generated: ${date}`,
            ``,
            `── GROUP ──────────────────────────────`,
            `Members : ${members.map(m => m.name).join(', ')}`,
            `Expenses: ${expenses.length}`,
            `Total   : ${sym}${totalSpent.toLocaleString('en-IN')}`,
            ``,
            `── TRANSACTIONS ────────────────────────`,
            ...expenses.map(e => {
                const payer = members.find(m => m.id === e.paidBy)?.name || '?';
                const split = (e.splitAmong || []).map(id => members.find(m => m.id === id)?.name || '?').join(', ');
                return `• ${e.title} — ${sym}${e.amount} (paid by ${payer}, split: ${split})`;
            }),
            ``,
            `── SETTLEMENTS ─────────────────────────`,
            ...(debts.length === 0
                ? ['✅ All settled up!']
                : debts.map(d => `• ${d.fromName}  →  ${d.toName}  :  ${sym}${d.amount.toFixed(2)}`)),
            ``,
            `── NET BALANCES ─────────────────────────`,
            ...balances.map(b => `• ${b.name}: ${b.net >= 0 ? '+' : ''}${sym}${b.net.toFixed(2)}`),
            ``,
            `────────────────────────────────────────`,
        ];
        return lines.join('\n');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(buildText()).then(() => {
            setCopied(true);
            toast.success('Summary copied to clipboard!');
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([buildText()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-summary-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Summary downloaded!');
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
                title="Copy summary to clipboard"
            >
                {copied ? '✅ Copied!' : '📋 Copy Summary'}
            </button>
            <button
                className="btn btn-secondary btn-sm"
                onClick={handleDownload}
                title="Download as .txt"
            >
                ⬇️ Export
            </button>
        </div>
    );
}
