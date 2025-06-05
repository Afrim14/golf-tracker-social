import React, { useState } from 'react';
import { Plus, Minus, Save, X, Calendar, MapPin, Cloud } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';
import Button from '../common/Button';

const ScorecardForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    course_name: '',
    date_played: new Date().toISOString().split('T')[0],
    weather: '',
    notes: '',
    holes: Array.from({ length: 18 }, (_, i) => ({
      hole_number: i + 1,
      par: 4,
      score: 4
    }))
  });

  const [loading, setLoading] = useState(false);

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    basicInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
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
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: golfTheme.borderRadius.medium,
      border: `2px solid ${golfTheme.colors.accent}`,
      fontSize: '14px',
      transition: 'all 0.3s ease',
    },
    textarea: {
      padding: '12px 16px',
      borderRadius: golfTheme.borderRadius.medium,
      border: `2px solid ${golfTheme.colors.accent}`,
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    holesSection: {
      marginTop: '8px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    holesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
    },
    holeCard: {
      background: golfTheme.gradients.card,
      border: `2px solid ${golfTheme.colors.accent}`,
      borderRadius: golfTheme.borderRadius.medium,
      padding: '12px',
      textAlign: 'center',
    },
    holeNumber: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: golfTheme.colors.textSecondary,
      marginBottom: '8px',
    },
    scoreInputs: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    scoreRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '4px',
    },
    scoreLabel: {
      fontSize: '10px',
      color: golfTheme.colors.textSecondary,
      fontWeight: '600',
      minWidth: '25px',
    },
    scoreControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    scoreButton: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: 'none',
      background: golfTheme.colors.accent,
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    scoreValue: {
      minWidth: '24px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      color: golfTheme.colors.primary,
    },
    summary: {
      background: golfTheme.gradients.fairway,
      color: 'white',
      padding: '16px',
      borderRadius: golfTheme.borderRadius.medium,
      display: 'flex',
      justifyContent: 'space-around',
      textAlign: 'center',
    },
    summaryItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    summaryValue: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    summaryLabel: {
      fontSize: '12px',
      opacity: 0.9,
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '8px',
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHoleChange = (holeIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      holes: prev.holes.map((hole, index) => 
        index === holeIndex 
          ? { ...hole, [field]: Math.max(1, Math.min(field === 'par' ? 6 : 15, value)) }
          : hole
      )
    }));
  };

  const adjustScore = (holeIndex, field, delta) => {
    const currentValue = formData.holes[holeIndex][field];
    const newValue = currentValue + delta;
    handleHoleChange(holeIndex, field, newValue);
  };

  const calculateTotals = () => {
    const totalPar = formData.holes.reduce((sum, hole) => sum + hole.par, 0);
    const totalScore = formData.holes.reduce((sum, hole) => sum + hole.score, 0);
    const relativeToPar = totalScore - totalPar;
    return { totalPar, totalScore, relativeToPar };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        date_played: new Date(formData.date_played).toISOString(),
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const { totalPar, totalScore, relativeToPar } = calculateTotals();

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.basicInfo}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <MapPin size={16} />
            Course Name
          </label>
          <input
            type="text"
            name="course_name"
            value={formData.course_name}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Enter course name"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <Calendar size={16} />
            Date Played
          </label>
          <input
            type="date"
            name="date_played"
            value={formData.date_played}
            onChange={handleInputChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <Cloud size={16} />
            Weather
          </label>
          <select
            name="weather"
            value={formData.weather}
            onChange={handleInputChange}
            style={styles.input}
          >
            <option value="">Select weather</option>
            <option value="Sunny">☀️ Sunny</option>
            <option value="Partly Cloudy">⛅ Partly Cloudy</option>
            <option value="Cloudy">☁️ Cloudy</option>
            <option value="Rainy">🌧️ Rainy</option>
            <option value="Windy">💨 Windy</option>
          </select>
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          style={styles.textarea}
          placeholder="Add notes about your round..."
        />
      </div>

      <div style={styles.holesSection}>
        <h3 style={styles.sectionTitle}>⛳ Hole-by-Hole Scores</h3>
        
        <div style={styles.holesGrid}>
          {formData.holes.map((hole, index) => (
            <div key={hole.hole_number} style={styles.holeCard}>
              <div style={styles.holeNumber}>Hole {hole.hole_number}</div>
              
              <div style={styles.scoreInputs}>
                <div style={styles.scoreRow}>
                  <span style={styles.scoreLabel}>Par</span>
                  <div style={styles.scoreControl}>
                    <button
                      type="button"
                      style={styles.scoreButton}
                      onClick={() => adjustScore(index, 'par', -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={styles.scoreValue}>{hole.par}</span>
                    <button
                      type="button"
                      style={styles.scoreButton}
                      onClick={() => adjustScore(index, 'par', 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div style={styles.scoreRow}>
                  <span style={styles.scoreLabel}>Score</span>
                  <div style={styles.scoreControl}>
                    <button
                      type="button"
                      style={styles.scoreButton}
                      onClick={() => adjustScore(index, 'score', -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={styles.scoreValue}>{hole.score}</span>
                    <button
                      type="button"
                      style={styles.scoreButton}
                      onClick={() => adjustScore(index, 'score', 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{totalScore}</div>
            <div style={styles.summaryLabel}>Total Score</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{totalPar}</div>
            <div style={styles.summaryLabel}>Total Par</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>
              {relativeToPar > 0 ? `+${relativeToPar}` : relativeToPar}
            </div>
            <div style={styles.summaryLabel}>Relative to Par</div>
          </div>
        </div>
      </div>

      <div style={styles.buttons}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={16} />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          size="large"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Round'}
        </Button>
      </div>
    </form>
  );
};

export default ScorecardForm;
