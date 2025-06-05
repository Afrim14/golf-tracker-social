import React from 'react';
import { X } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out',
    },
    modal: {
      background: golfTheme.gradients.card,
      borderRadius: golfTheme.borderRadius.large,
      boxShadow: golfTheme.shadows.large,
      maxWidth,
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
      animation: 'fadeIn 0.3s ease-out',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 24px 0 24px',
      borderBottom: `1px solid ${golfTheme.colors.accent}`,
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: 0,
    },
    content: {
      padding: '0 24px 24px 24px',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            style={{ padding: '8px', borderRadius: '50%', minWidth: 'auto' }}
          >
            <X size={16} />
          </Button>
        </div>
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
