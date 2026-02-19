import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useApp();
    const isDark = theme === 'dark';

    return (
        <button
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{
                position: 'relative',
                width: 52,
                height: 28,
                borderRadius: 99,
                border: '1px solid var(--border-medium)',
                background: isDark
                    ? 'linear-gradient(135deg,#1e1e40,#0f0f22)'
                    : 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                cursor: 'pointer',
                padding: 0,
                overflow: 'hidden',
                transition: 'background 0.4s ease, border-color 0.4s ease',
                boxShadow: isDark
                    ? '0 0 12px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 0 16px rgba(245,158,11,0.4)',
            }}
        >
            {/* Stars (dark mode) */}
            {isDark && (
                <>
                    {[
                        { top: '20%', left: '20%', size: 2 },
                        { top: '60%', left: '30%', size: 1.5 },
                        { top: '35%', left: '40%', size: 1 },
                    ].map((star, i) => (
                        <span key={i} style={{
                            position: 'absolute',
                            top: star.top, left: star.left,
                            width: star.size, height: star.size,
                            borderRadius: '50%',
                            background: '#fff',
                            opacity: 0.7,
                            animation: `twinkle ${1 + i * 0.4}s ease-in-out infinite alternate`,
                        }} />
                    ))}
                </>
            )}

            {/* Thumb */}
            <span style={{
                position: 'absolute',
                top: 3,
                left: isDark ? 3 : 25,
                width: 20, height: 20,
                borderRadius: '50%',
                background: isDark
                    ? 'linear-gradient(135deg,#c4b5fd,#7c3aed)'
                    : 'linear-gradient(135deg,#fff,#fef3c7)',
                boxShadow: isDark
                    ? '0 2px 8px rgba(124,58,237,0.6)'
                    : '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.4s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem',
            }}>
                {isDark ? '🌙' : '☀️'}
            </span>

            <style>{`
        @keyframes twinkle {
          from { opacity: 0.3; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
        </button>
    );
}
