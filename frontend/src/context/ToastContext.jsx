import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
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

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'info': return <Info size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'success': return golfTheme.colors.success;
      case 'error': return golfTheme.colors.error;
      case 'info': return golfTheme.colors.water;
      default: return golfTheme.colors.success;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: golfTheme.gradients.card,
              border: `2px solid ${getToastColor(toast.type)}`,
              borderRadius: golfTheme.borderRadius.medium,
              padding: '16px 20px',
              minWidth: '300px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: golfTheme.shadows.large,
              animation: 'slideIn 0.3s ease-out',
              color: getToastColor(toast.type),
              cursor: 'pointer'
            }}
            onClick={() => removeToast(toast.id)}
          >
            {getToastIcon(toast.type)}
            <span style={{ fontWeight: '500', flex: 1 }}>{toast.message}</span>
            <X size={16} style={{ opacity: 0.7 }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
