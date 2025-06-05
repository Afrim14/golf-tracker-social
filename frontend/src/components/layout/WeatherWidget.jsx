import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react';
import { golfTheme } from '../../styles/golfTheme';

const WeatherWidget = () => {
  const [weather] = useState({
    condition: 'sunny',
    temperature: 72,
    wind: '5 mph',
    humidity: '45%'
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

  const styles = {
    widget: {
      background: golfTheme.gradients.weather,
      borderRadius: golfTheme.borderRadius.medium,
      padding: '16px',
      color: 'white',
      boxShadow: '0 4px 15px rgba(135, 206, 235, 0.3)',
    },
    top: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    temp: {
      fontSize: '18px',
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: '12px',
      opacity: 0.8,
    },
    bottom: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
    }
  };

  return (
    <div style={styles.widget}>
      <div style={styles.top}>
        {getWeatherIcon(weather.condition)}
        <div>
          <div style={styles.temp}>{weather.temperature}°F</div>
          <div style={styles.subtitle}>Perfect for golf!</div>
        </div>
      </div>
      <div style={styles.bottom}>
        <span>Wind: {weather.wind}</span>
        <span>Humidity: {weather.humidity}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
