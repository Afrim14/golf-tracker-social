import React, { createContext, useContext, useState } from 'react';
import { golfTheme } from '../styles/golfTheme';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (config) => {
    const { message, type = 'success', duration = 3000 } = config;
    const id = Date.now();
    
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const toastStyles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
    },
    toast: {
      background: golfTheme.gradients.card,
      color: 'white',
      padding: '16px 20px',
      marginBottom: '8px',
      minWidth: '300px',
      borderRadius: golfTheme.borderRadius.medium,
      boxShadow: golfTheme.shadows.medium,
      animation: 'slideIn 0.3s ease-out',
    },
    success: {
      backgroundColor: golfTheme.colors.fairway,
    },
    error: {
      backgroundColor: '#f44336',
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={toastStyles.container}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              ...toastStyles.toast,
              ...(toast.type === 'success' ? toastStyles.success : toastStyles.error),
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
