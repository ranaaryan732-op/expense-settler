import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import ChatBot from './components/ChatBot';
import Dashboard from './components/Dashboard';

export default function App() {
    return (
        <AppProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e1e35',
                        color: '#f1f5f9',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
                }}
            />
            <Dashboard />
            <ChatBot />
        </AppProvider>
    );
}
