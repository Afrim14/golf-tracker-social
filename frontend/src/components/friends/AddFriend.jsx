import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { golfTheme } from '../../styles/golfTheme';
import apiService from '../../services/apiService';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AddFriend = ({ onClose, onSuccess }) => {
  const [friendCode, setFriendCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: golfTheme.colors.primary,
    },
    input: {
      padding: '12px 16px',
      borderRadius: golfTheme.borderRadius.medium,
      border: `2px solid ${golfTheme.colors.accent}`,
      fontSize: '16px',
      fontFamily: 'monospace',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    hint: {
      fontSize: '12px',
      color: golfTheme.colors.textSecondary,
      textAlign: 'center',
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!friendCode.trim()) {
      showToast('Please enter a friend code', 'error');
      return;
    }

    setLoading(true);

    try {
      await apiService.addFriend(friendCode.trim().toUpperCase());
      showToast('Friend added successfully!', 'success');
      onSuccess();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setFriendCode(value);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add Golf Friend"
    >
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Friend Code</label>
          <input
            type="text"
            value={friendCode}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="ABC123"
            maxLength={6}
            required
          />
          <p style={styles.hint}>
            Enter your friend's 6-character code to connect
          </p>
        </div>

        <div style={styles.buttons}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || friendCode.length !== 6}
          >
            <UserPlus size={16} />
            {loading ? 'Adding...' : 'Add Friend'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFriend;
