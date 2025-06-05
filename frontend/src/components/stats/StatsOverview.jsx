import React from 'react';
import { Trophy, TrendingUp, Target, Calendar, MapPin, Award } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';
import Card from '../common/Card';

const StatsOverview = ({ stats, recentScorecards }) => {
  const styles = {
    container: {
      display: 'grid',
      gap: '24px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    statCard: {
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    statIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: golfTheme.shadows.medium,
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: '0 0 8px 0',
    },
    statLabel: {
      fontSize: '14px',
      color: golfTheme.colors.textSecondary,
      fontWeight: '500',
    },
    recentRounds: {
      marginTop: '32px',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    roundsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
    },
    roundCard: {
      padding: '20px',
      border: `2px solid ${golfTheme.colors.accent}`,
    },
    roundHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },
    courseName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: 0,
    },
    roundDate: {
      fontSize: '12px',
      color: golfTheme.colors.textSecondary,
    },
    scoreDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
    },
    totalScore: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
    },
    parScore: {
      fontSize: '16px',
      color: golfTheme.colors.textSecondary,
    },
    relativeScore: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    roundDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: golfTheme.colors.textSecondary,
    }
  };

  const getRelativeScoreStyle = (relativeScore) => {
    if (relativeScore < 0) {
      return {
        backgroundColor: golfTheme.colors.success,
        color: 'white',
      };
    } else if (relativeScore === 0) {
      return {
        backgroundColor: golfTheme.colors.fairway,
        color: 'white',
      };
    } else {
      return {
        backgroundColor: golfTheme.colors.sand,
        color: golfTheme.colors.primary,
      };
    }
  };

  const formatRelativeScore = (score) => {
    if (score > 0) return `+${score}`;
    return score.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!stats) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Trophy size={48} color={golfTheme.colors.textSecondary} />
          <h3 style={{ color: golfTheme.colors.textSecondary, marginTop: '16px' }}>
            No golf data yet
          </h3>
          <p style={{ color: golfTheme.colors.textSecondary }}>
            Add your first round to see your stats!
          </p>
        </div>
      </Card>
    );
  }

  const statItems = [
    {
      icon: <Calendar size={24} color="white" />,
      iconBg: golfTheme.gradients.fairway,
      value: stats.total_rounds,
      label: 'Total Rounds'
    },
    {
      icon: <TrendingUp size={24} color="white" />,
      iconBg: golfTheme.gradients.secondary,
      value: stats.avg_relative_to_par ? `${formatRelativeScore(stats.avg_relative_to_par)}` : 'N/A',
      label: 'Average Score'
    },
    {
      icon: <Trophy size={24} color="white" />,
      iconBg: golfTheme.gradients.achievement,
      value: stats.best_round ? formatRelativeScore(stats.best_round.relative_to_par) : 'N/A',
      label: 'Best Round'
    },
    {
      icon: <MapPin size={24} color="white" />,
      iconBg: golfTheme.gradients.sky,
      value: Object.keys(stats.courses_played).length,
      label: 'Courses Played'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <Card key={index} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: item.iconBg }}>
              {item.icon}
            </div>
            <div style={styles.statValue}>{item.value}</div>
            <div style={styles.statLabel}>{item.label}</div>
          </Card>
        ))}
      </div>

      {recentScorecards && recentScorecards.length > 0 && (
        <div style={styles.recentRounds}>
          <h3 style={styles.sectionTitle}>
            <Award size={24} color={golfTheme.colors.primary} />
            Recent Rounds
          </h3>
          <div style={styles.roundsGrid}>
            {recentScorecards.map((scorecard) => (
              <Card key={scorecard.id} style={styles.roundCard}>
                <div style={styles.roundHeader}>
                  <div>
                    <h4 style={styles.courseName}>{scorecard.course_name}</h4>
                    <div style={styles.roundDate}>
                      {formatDate(scorecard.date_played)}
                    </div>
                  </div>
                  <div style={{
                    ...styles.relativeScore,
                    ...getRelativeScoreStyle(scorecard.relative_to_par)
                  }}>
                    {formatRelativeScore(scorecard.relative_to_par)}
                  </div>
                </div>
                
                <div style={styles.scoreDisplay}>
                  <span style={styles.totalScore}>{scorecard.total_score}</span>
                  <span style={styles.parScore}>/ {scorecard.total_par}</span>
                </div>
                
                <div style={styles.roundDetails}>
                  <span>{scorecard.holes.length} holes</span>
                  {scorecard.weather && <span>{scorecard.weather}</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;
