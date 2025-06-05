import React from 'react';
import { golfTheme } from '../../styles/golfTheme';

const Loading = () => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: golfTheme.gradients.background,
    },
    card: {
      background: golfTheme.gradients.card,
      borderRadius: golfTheme.borderRadius.large,
      padding: '40px',
      boxShadow: golfTheme.shadows.large,
      textAlign: 'center',
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: '4px solid #e8f5e8',
      borderTop: '4px solid #4caf50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px',
    },
    text: {
      color: golfTheme.colors.primary,
      fontSize: '18px',
      fontWeight: '500',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Loading your golf experience...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Loading;
