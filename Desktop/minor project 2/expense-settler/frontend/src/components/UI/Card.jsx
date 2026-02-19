import React from 'react';

export default function Card({ title, icon, action, className = '', children }) {
    return (
        <div className={`glass-card ${className}`} style={{ display: 'flex', flexDirection: 'column' }}>
            {(title || action) && (
                <div className="card-header">
                    {title && (
                        <div className="card-title">
                            {icon && (
                                <span style={{
                                    fontSize: '1.1rem',
                                    filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.5))',
                                    transition: 'filter 0.3s ease',
                                }}>
                                    {icon}
                                </span>
                            )}
                            {title}
                        </div>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
}
