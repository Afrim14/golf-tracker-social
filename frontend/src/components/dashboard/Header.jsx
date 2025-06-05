import React from 'react';
import { Target, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { golfTheme } from '../../styles/golfTheme';
import Button from '../common/Button';
import WeatherWidget from './WeatherWidget';

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
      maxWidth: '1200px',
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
      gap: '24px',
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
      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
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
    centerSection: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
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
    userIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userText: {
      textAlign: 'right',
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      margin: 0,
    },
    userSubtext: {
      fontSize: '12px',
      opacity: 0.8,
      margin: 0,
    },
    friendCode: {
      fontSize: '10px',
      opacity: 0.7,
      fontFamily: 'monospace',
      margin: 0,
    }
  };

  return (
    <nav style={styles.header}>
      <div style={styles.overlay}></div>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <Target size={24} color={golfTheme.colors.primary} />
            </div>
            <div>
              <h1 style={styles.logoText}>GolfTracker Pro</h1>
              <p style={styles.logoSubtext}>Your premium golf companion</p>
            </div>
          </div>

          <div style={styles.centerSection}>
            <WeatherWidget />
          </div>

          <div style={styles.rightSection}>
            <Button
              onClick={onAddRound}
              variant="achievement"
              style={{
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              }}
            >
              <Plus size={16} />
              New Round
            </Button>

            <div style={styles.userInfo}>
              <div style={styles.userIcon}>
                <User size={20} color="white" />
              </div>
              <div style={styles.userText}>
                <p style={styles.userName}>Welcome, {user?.username}!</p>
                <p style={styles.userSubtext}>Ready for golf?</p>
                <p style={styles.friendCode}>Code: {user?.friend_code}</p>
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
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;