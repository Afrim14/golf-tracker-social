import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { golfTheme } from '../../styles/golfTheme';
import Button from '../common/Button';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      textAlign: 'center',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: golfTheme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: '24px',
    },
    inputGroup: {
      position: 'relative',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: golfTheme.colors.primary,
      marginBottom: '8px',
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      borderRadius: golfTheme.borderRadius.medium,
      border: `2px solid ${golfTheme.colors.accent}`,
      fontSize: '16px',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
    },
    inputIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1,
    },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      showToast('Welcome back to GolfTracker Pro!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your golf account</p>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Email Address</label>
        <div style={styles.inputContainer}>
          <div style={styles.inputIcon}>
            <Mail size={20} color={golfTheme.colors.textSecondary} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Password</label>
        <div style={styles.inputContainer}>
          <div style={styles.inputIcon}>
            <Lock size={20} color={golfTheme.colors.textSecondary} />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        size="large"
        style={{ marginTop: '16px' }}
      >
        <LogIn size={20} />
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
