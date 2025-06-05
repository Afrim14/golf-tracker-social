import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { golfTheme } from '../../styles/golfTheme';
import apiService from '../../services/apiService';
import Header from './Header';
import StatsOverview from '../stats/StatsOverview';
import ScorecardList from '../scorecard/ScorecardList';
import ScorecardForm from '../scorecard/ScorecardForm';
import FriendsList from '../friends/FriendsList';
import Modal from '../common/Modal';
import Button from '../common/Button';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showScorecardForm, setShowScorecardForm] = useState(false);
  const [scorecards, setScorecards] = useState([]);
  const [stats, setStats] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const styles = {
    container: {
      minHeight: '100vh',
      background: golfTheme.gradients.background,
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px',
      borderRadius: golfTheme.borderRadius.large,
      boxShadow: golfTheme.shadows.medium,
    },
    tab: {
      padding: '12px 24px',
      borderRadius: golfTheme.borderRadius.medium,
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      flex: 1,
      textAlign: 'center',
    },
    activeTab: {
      background: golfTheme.gradients.fairway,
      color: 'white',
      boxShadow: golfTheme.shadows.small,
    },
    inactiveTab: {
      background: 'transparent',
      color: golfTheme.colors.textSecondary,
    },
    tabContent: {
      animation: 'fadeIn 0.5s ease-out',
    },
    quickActions: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'scorecards', label: 'Scorecards', icon: '📋' },
    { id: 'friends', label: 'Friends', icon: '👥' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [scorecardsData, statsData, friendsData] = await Promise.all([
        apiService.getScorecards(),
        apiService.getStats(),
        apiService.getFriends(),
      ]);
      
      setScorecards(scorecardsData);
      setStats(statsData);
      setFriends(friendsData);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScorecardSubmit = async (scorecardData) => {
    try {
      await apiService.createScorecard(scorecardData);
      showToast('Scorecard saved successfully!', 'success');
      setShowScorecardForm(false);
      loadDashboardData(); // Refresh data
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={styles.tabContent}>
            <div style={styles.quickActions}>
              <Button 
                onClick={() => setShowScorecardForm(true)}
                variant="achievement"
                size="large"
              >
                <Plus size={20} />
                Add New Round
              </Button>
            </div>
            <StatsOverview stats={stats} recentScorecards={scorecards.slice(0, 3)} />
          </div>
        );
      case 'scorecards':
        return (
          <div style={styles.tabContent}>
            <div style={styles.quickActions}>
              <Button 
                onClick={() => setShowScorecardForm(true)}
                variant="achievement"
              >
                <Plus size={20} />
                Add New Round
              </Button>
            </div>
            <ScorecardList scorecards={scorecards} onRefresh={loadDashboardData} />
          </div>
        );
      case 'friends':
        return (
          <div style={styles.tabContent}>
            <FriendsList friends={friends} onRefresh={loadDashboardData} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <Header onAddRound={() => setShowScorecardForm(true)} />
      
      <div style={styles.content}>
        <div style={styles.tabContainer}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : styles.inactiveTab),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>

        {renderTabContent()}
      </div>

      <Modal
        isOpen={showScorecardForm}
        onClose={() => setShowScorecardForm(false)}
        title="Add New Golf Round"
        maxWidth="800px"
      >
        <ScorecardForm 
          onSubmit={handleScorecardSubmit}
          onCancel={() => setShowScorecardForm(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
