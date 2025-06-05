import React, { useState } from 'react';
import { Calendar, MapPin, Eye, Edit, Trash2, Cloud, FileText } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ScorecardList = ({ scorecards, onRefresh }) => {
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: 0,
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: golfTheme.colors.textSecondary,
    },
    emptyIcon: {
      marginBottom: '16px',
    },
    scorecardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '16px',
    },
    scorecardCard: {
      position: 'relative',
      cursor: 'pointer',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    courseInfo: {
      flex: 1,
    },
    courseName: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      margin: '0 0 4px 0',
    },
    dateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: golfTheme.colors.textSecondary,
      fontSize: '14px',
      marginBottom: '8px',
    },
    weatherInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: golfTheme.colors.textSecondary,
      fontSize: '12px',
    },
    scoreSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },
    scoreDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    totalScore: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
    },
    parScore: {
      fontSize: '18px',
      color: golfTheme.colors.textSecondary,
    },
    relativeScore: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    actions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
    },
    holesPreview: {
      display: 'grid',
      gridTemplateColumns: 'repeat(9, 1fr)',
      gap: '4px',
      marginBottom: '16px',
    },
    holePreview: {
      textAlign: 'center',
      fontSize: '10px',
      padding: '4px 2px',
      borderRadius: '4px',
      backgroundColor: golfTheme.colors.cream,
    },
    holesTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
    },
    tableHeader: {
      backgroundColor: golfTheme.colors.fairway,
      color: 'white',
    },
    tableCell: {
      padding: '8px 12px',
      textAlign: 'center',
      border: `1px solid ${golfTheme.colors.accent}`,
    },
    notesSection: {
      backgroundColor: golfTheme.colors.cream,
      padding: '16px',
      borderRadius: golfTheme.borderRadius.medium,
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const getHoleResultColor = (score, par) => {
    const diff = score - par;
    if (diff <= -2) return golfTheme.colors.success;
    if (diff === -1) return golfTheme.colors.fairway;
    if (diff === 0) return golfTheme.colors.accent;
    if (diff === 1) return golfTheme.colors.sand;
    return golfTheme.colors.error;
  };

  const handleViewDetails = (scorecard) => {
    setSelectedScorecard(scorecard);
    setShowDetails(true);
  };

  if (!scorecards || scorecards.length === 0) {
    return (
      <Card>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Calendar size={48} color={golfTheme.colors.textSecondary} />
          </div>
          <h3>No scorecards yet</h3>
          <p>Add your first golf round to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Golf Rounds</h2>
      </div>

      <div style={styles.scorecardGrid}>
        {scorecards.map((scorecard) => (
          <Card key={scorecard.id} style={styles.scorecardCard}>
            <div style={styles.cardHeader}>
              <div style={styles.courseInfo}>
                <h3 style={styles.courseName}>{scorecard.course_name}</h3>
                <div style={styles.dateInfo}>
                  <Calendar size={14} />
                  {formatDate(scorecard.date_played)}
                </div>
                {scorecard.weather && (
                  <div style={styles.weatherInfo}>
                    <Cloud size={12} />
                    {scorecard.weather}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.scoreSection}>
              <div style={styles.scoreDisplay}>
                <span style={styles.totalScore}>{scorecard.total_score}</span>
                <span style={styles.parScore}>/ {scorecard.total_par}</span>
              </div>
              <div style={{
                ...styles.relativeScore,
                ...getRelativeScoreStyle(scorecard.relative_to_par)
              }}>
                {formatRelativeScore(scorecard.relative_to_par)}
              </div>
            </div>

            <div style={styles.holesPreview}>
              {scorecard.holes.slice(0, 9).map((hole, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.holePreview,
                    backgroundColor: getHoleResultColor(hole.score, hole.par),
                    color: hole.score - hole.par <= 0 ? 'white' : golfTheme.colors.primary,
                  }}
                >
                  {hole.score}
                </div>
              ))}
            </div>

            <div style={styles.actions}>
              <Button
                size="small"
                variant="secondary"
                onClick={() => handleViewDetails(scorecard)}
              >
                <Eye size={14} />
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Scorecard Details"
        maxWidth="900px"
      >
        {selectedScorecard && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div style={{borderBottom: `2px solid ${golfTheme.colors.accent}`, paddingBottom: '16px'}}>
              <h3 style={styles.courseName}>{selectedScorecard.course_name}</h3>
              <div style={styles.dateInfo}>
                <Calendar size={16} />
                {formatDate(selectedScorecard.date_played)}
              </div>
            </div>

            <table style={styles.holesTable}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableCell}>Hole</th>
                  {selectedScorecard.holes.map((hole) => (
                    <th key={hole.hole_number} style={styles.tableCell}>
                      {hole.hole_number}
                    </th>
                  ))}
                  <th style={styles.tableCell}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{...styles.tableCell, fontWeight: 'bold'}}>Par</td>
                  {selectedScorecard.holes.map((hole) => (
                    <td key={hole.hole_number} style={styles.tableCell}>
                      {hole.par}
                    </td>
                  ))}
                  <td style={{...styles.tableCell, fontWeight: 'bold'}}>
                    {selectedScorecard.total_par}
                  </td>
                </tr>
                <tr>
                  <td style={{...styles.tableCell, fontWeight: 'bold'}}>Score</td>
                  {selectedScorecard.holes.map((hole) => (
                    <td 
                      key={hole.hole_number} 
                      style={{
                        ...styles.tableCell,
                        backgroundColor: getHoleResultColor(hole.score, hole.par),
                        color: hole.score - hole.par <= 0 ? 'white' : golfTheme.colors.primary,
                        fontWeight: 'bold'
                      }}
                    >
                      {hole.score}
                    </td>
                  ))}
                  <td style={{...styles.tableCell, fontWeight: 'bold', fontSize: '16px'}}>
                    {selectedScorecard.total_score}
                  </td>
                </tr>
              </tbody>
            </table>

            {selectedScorecard.notes && (
              <div style={styles.notesSection}>
                <h4 style={{color: golfTheme.colors.primary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FileText size={16} />
                  Notes
                </h4>
                <p style={{margin: 0, color: golfTheme.colors.text}}>{selectedScorecard.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScorecardList;
