import { useApp } from '../context/AppContext';

/**
 * useDebts – convenience hook that exposes debt-related state.
 * Wraps AppContext so components only need one import.
 */
export function useDebts() {
    const { debts, balances, loading, fetchDebts } = useApp();
    return { debts, balances, loading: loading.debts, refetch: fetchDebts };
}
