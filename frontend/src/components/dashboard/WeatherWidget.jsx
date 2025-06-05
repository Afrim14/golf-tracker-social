import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, Thermometer } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';

const WeatherWidget = () => {
  const [weather] = useState({
    condition: 'sunny',
    temperature: 72,
    wind: '5 mph NW',
    humidity: '45%',
    golfCondition: 'Perfect'
  });

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun size={24} color="white" />;
      case 'cloudy': return <Cloud size={24} color="white" />;
      case 'rainy': return <CloudRain size={24} color="white" />;
      case 'windy': return <Wind size={24} color="white" />;
      default: return <Sun size={24} color="white" />;
    }
  };

  const getGolfConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'perfect': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#4caf50';
    }
  };

  const styles = {
    widget: {
      background: golfTheme.gradients.sky,
      borderRadius: golfTheme.borderRadius.large,
      padding: '20px',
      color: 'white',
      boxShadow: '0 4px 20px rgba(135, 206, 235, 0.4)',
      minWidth: '280px',
      position: 'relative',
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.1)',
      pointerEvents: 'none',
    },
    content: {
      position: 'relative',
      zIndex: 1,
    },
    top: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '16px',
    },
    tempSection: {
      flex: 1,
    },
    temp: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0,
    },
    tempUnit: {
      fontSize: '18px',
      opacity: 0.8,
    },
    location: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0,
    },
    bottom: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      fontSize: '12px',
    },
    metric: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    golfCondition: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      marginTop: '8px',
      padding: '8px',
      borderRadius: golfTheme.borderRadius.small,
      background: 'rgba(255, 255, 255, 0.2)',
      fontWeight: 'bold',
    },
    conditionDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: getGolfConditionColor(weather.golfCondition),
      marginRight: '6px',
    }
  };

  return (
    <div style={styles.widget}>
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <div style={styles.top}>
          {getWeatherIcon(weather.condition)}
          <div style={styles.tempSection}>
            <div style={styles.temp}>
              {weather.temperature}
              <span style={styles.tempUnit}>°F</span>
            </div>
            <p style={styles.location}>Perfect golf weather!</p>
          </div>
        </div>
        
        <div style={styles.bottom}>
          <div style={styles.metric}>
            <Wind size={14} />
            <span>{weather.wind}</span>
          </div>
          <div style={styles.metric}>
            <Thermometer size={14} />
            <span>{weather.humidity}</span>
          </div>
          
          <div style={styles.golfCondition}>
            <span style={styles.conditionDot}></span>
            Golf Conditions: {weather.golfCondition}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
