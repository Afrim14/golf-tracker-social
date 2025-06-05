import React, { useState } from 'react';
import { Target, Trophy, TrendingUp, Users } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Card from '../common/Card';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      background: golfTheme.gradients.background,
    },
    leftSide: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px',
      position: 'relative',
      overflow: 'hidden',
    },
    rightSide: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px',
    },
    heroContent: {
      textAlign: 'center',
      zIndex: 2,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      marginBottom: '32px',
    },
    logoIcon: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: golfTheme.gradients.achievement,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: golfTheme.shadows.large,
    },
    logoText: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: 0,
    },
    tagline: {
      fontSize: '24px',
      color: golfTheme.colors.secondary,
      marginBottom: '48px',
      fontWeight: '300',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginTop: '48px',
    },
    feature: {
      textAlign: 'center',
      padding: '24px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: golfTheme.borderRadius.medium,
      boxShadow: golfTheme.shadows.small,
    },
    featureIcon: {
      marginBottom: '16px',
    },
    featureTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      marginBottom: '8px',
    },
    featureDesc: {
      fontSize: '14px',
      color: golfTheme.colors.textSecondary,
    },
    authCard: {
      width: '100%',
      maxWidth: '400px',
    },
    toggleText: {
      textAlign: 'center',
      marginTop: '24px',
      color: golfTheme.colors.textSecondary,
    },
    toggleLink: {
      color: golfTheme.colors.primary,
      fontWeight: 'bold',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  };

  const features = [
    {
      icon: <Trophy size={32} color={golfTheme.colors.sand} />,
      title: 'Track Performance',
      description: 'Record and analyze every round with detailed statistics'
    },
    {
      icon: <TrendingUp size={32} color={golfTheme.colors.fairway} />,
      title: 'Improve Your Game',
      description: 'Get insights and track your progress over time'
    },
    {
      icon: <Users size={32} color={golfTheme.colors.water} />,
      title: 'Connect with Friends',
      description: 'Share rounds and compete with your golf buddies'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.heroContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Target size={40} color={golfTheme.colors.primary} />
            </div>
            <h1 style={styles.logoText}>GolfTracker Pro</h1>
          </div>
          
          <p style={styles.tagline}>
            Your Premium Golf Companion
          </p>
          
          <div style={styles.features}>
            {features.map((feature, index) => (
              <div key={index} style={styles.feature} className="fade-in">
                <div style={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.rightSide}>
        <Card style={styles.authCard}>
          {isLogin ? <LoginForm /> : <RegisterForm />}
          
          <div style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              style={styles.toggleLink}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
