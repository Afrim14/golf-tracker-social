import React from 'react';
import { Target } from 'lucide-react';
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
      borderRadius: golfTheme.borderRadius.xl,
      padding: '48px',
      boxShadow: golfTheme.shadows.large,
      textAlign: 'center',
      border: `2px solid ${golfTheme.colors.fairway}`,
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px',
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: `4px solid ${golfTheme.colors.accent}`,
      borderTop: `4px solid ${golfTheme.colors.fairway}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    text: {
      color: golfTheme.colors.primary,
      fontSize: '18px',
      fontWeight: '600',
      marginTop: '16px',
    },
    subtext: {
      color: golfTheme.colors.textSecondary,
      fontSize: '14px',
      marginTop: '8px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <div style={{ position: 'relative' }}>
            <Target size={32} color={golfTheme.colors.fairway} className="bounce" />
            <div style={styles.spinner}></div>
          </div>
        </div>
        <p style={styles.text}>Loading GolfTracker Pro</p>
        <p style={styles.subtext}>Preparing your premium golf experience...</p>
      </div>
    </div>
  );
};

export default Loading;
