import React from 'react';
import { Golf, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import WeatherWidget from './WeatherWidget';
import { golfTheme } from '../../styles/golfTheme';

const Header = ({ onAddRound }) => {
  const { user, logout } = useAuth();

  const styles = {
    header: {
      background: golfTheme.gradients.primary,
      boxShadow: '0 4px 20px rgba(45, 90, 39, 0.3)',
      position: 'relative',
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      pointerEvents: 'none',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 24px',
      position: 'relative',
      zIndex: 1,
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '80px',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    logoIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    logoSubtext: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.8)',
      margin: 0,
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
    },
    userText: {
      textAlign: 'right',
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500',
    },
    userSubtext: {
      fontSize: '12px',
      opacity: 0.8,
    }
  };

  return (
    <nav style={styles.header}>
      <div style={styles.overlay}></div>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <Golf size={24} color={golfTheme.colors.primary} />
            </div>
            <div>
              <h1 style={styles.logoText}>GolfTracker Pro</h1>
              <p style={styles.logoSubtext}>Your premium golf companion</p>
            </div>
          </div>

          <div style={styles.rightSection}>
            <WeatherWidget />
            
            <Button
              onClick={onAddRound}
              style={{
                background: golfTheme.gradients.achievement,
                color: golfTheme.colors.primary,
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              }}
            >
              <Plus size={16} />
              New Round
            </Button>

            <div style={styles.userInfo}>
              <div style={styles.userText}>
                <div style={styles.userName}>Welcome back, {user?.username}!</div>
                <div style={styles.userSubtext}>Ready for another round?</div>
              </div>
              
              <Button
                onClick={logout}
                variant="secondary"
                size="small"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                }}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
