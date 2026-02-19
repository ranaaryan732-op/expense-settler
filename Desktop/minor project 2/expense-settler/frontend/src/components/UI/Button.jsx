import React from 'react';

/**
 * Button – styled button component
 * Props: variant ('primary'|'secondary'|'danger'|'ghost'), size ('sm'|'md'), icon, loading, ...rest
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    className = '',
    ...rest
}) {
    const sizeClass = size === 'sm' ? 'btn-sm' : '';
    return (
        <button
            className={`btn btn-${variant} ${sizeClass} ${className}`}
            disabled={loading || rest.disabled}
            {...rest}
        >
            {loading ? (
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
                icon && <span>{icon}</span>
            )}
            {children}
        </button>
    );
}
