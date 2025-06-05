import React, { useState } from 'react';
import { Users, UserPlus, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { golfTheme } from '../../styles/golfTheme';
import Card from '../common/Card';
import Button from '../common/Button';
import AddFriend from './AddFriend';

const FriendsList = ({ friends, onRefresh }) => {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    friendCodeSection: {
      background: golfTheme.gradients.achievement,
      padding: '20px',
      borderRadius: golfTheme.borderRadius.large,
      textAlign: 'center',
      marginBottom: '24px',
    },
    friendCodeTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      marginBottom: '8px',
    },
    friendCodeDisplay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    friendCode: {
      fontSize: '24px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      color: golfTheme.colors.primary,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '12px 20px',
      borderRadius: golfTheme.borderRadius.medium,
      letterSpacing: '2px',
    },
    copyButton: {
      minWidth: 'auto',
      padding: '8px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: golfTheme.colors.textSecondary,
    },
    emptyIcon: {
      marginBottom: '16px',
    },
    friendsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
    },
    friendCard: {
      position: 'relative',
      textAlign: 'center',
    },
    friendAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: golfTheme.gradients.fairway,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: golfTheme.shadows.medium,
    },
    friendName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: '0 0 4px 0',
    },
    friendUsername: {
      fontSize: '14px',
      color: golfTheme.colors.textSecondary,
      margin: '0 0 8px 0',
    },
    friendCode: {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: golfTheme.colors.textSecondary,
      background: golfTheme.colors.cream,
      padding: '4px 8px',
      borderRadius: golfTheme.borderRadius.small,
      display: 'inline-block',
      marginBottom: '16px',
    },
    friendActions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
    },
    addFriendSection: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px',
    }
  };

  const handleCopyFriendCode = async () => {
    try {
      await navigator.clipboard.writeText(user.friend_code);
      setCopiedCode(true);
      showToast('Friend code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      showToast('Failed to copy friend code', 'error');
    }
  };

  const handleAddFriendSuccess = () => {
    setShowAddFriend(false);
    onRefresh();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Users size={24} />
          Golf Friends
        </h2>
      </div>

      <Card style={styles.friendCodeSection}>
        <h3 style={styles.friendCodeTitle}>Your Friend Code</h3>
        <p style={{ color: golfTheme.colors.textSecondary, marginBottom: '16px' }}>
          Share this code with friends to connect
        </p>
        <div style={styles.friendCodeDisplay}>
          <span style={styles.friendCode}>{user?.friend_code}</span>
          <Button
            variant="secondary"
            size="small"
            onClick={handleCopyFriendCode}
            style={styles.copyButton}
          >
            {copiedCode ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
      </Card>

      <div style={styles.addFriendSection}>
        <Button
          onClick={() => setShowAddFriend(true)}
          variant="achievement"
        >
          <UserPlus size={16} />
          Add New Friend
        </Button>
      </div>

      {friends && friends.length > 0 ? (
        <div style={styles.friendsGrid}>
          {friends.map((friend) => (
            <Card key={friend.id} style={styles.friendCard}>
              <div style={styles.friendAvatar}>
                <Users size={32} color="white" />
              </div>
              <h3 style={styles.friendName}>
                {friend.full_name || friend.username}
              </h3>
              <p style={styles.friendUsername}>@{friend.username}</p>
              <span style={styles.friendCode}>{friend.friend_code}</span>
              <div style={styles.friendActions}>
                <Button size="small" variant="secondary">
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Users size={48} color={golfTheme.colors.textSecondary} />
            </div>
            <h3>No friends yet</h3>
            <p>Add friends to share and compare your golf rounds!</p>
          </div>
        </Card>
      )}

      {showAddFriend && (
        <AddFriend
          onClose={() => setShowAddFriend(false)}
          onSuccess={handleAddFriendSuccess}
        />
      )}
    </div>
  );
};

export default FriendsList;
