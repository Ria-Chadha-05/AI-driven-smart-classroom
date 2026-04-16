import axios from 'axios';
import Notification from '../models/Notification.js';

// --- Configuration ---
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = process.env.WEATHER_CITY || 'mumbai';
const COUNTRY_CODE = process.env.WEATHER_COUNTRY_CODE || 'IN';

const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${OPENWEATHER_API_KEY}`;

async function checkWeatherAndNotify() {
  if (!OPENWEATHER_API_KEY) {
    console.warn('Weather checker is disabled. OPENWEATHER_API_KEY is not set.');
    return { skipped: true, reason: 'API key not configured' };
  }

  console.log('Running daily weather check...');

  try {
    const response = await axios.get(WEATHER_API_URL);
    const weatherData = response.data;

    const weatherCondition = weatherData.weather[0].main;
    console.log(`Current weather in ${CITY}: ${weatherCondition}`);

    const isRainy = ['Rain', 'Thunderstorm', 'Drizzle'].includes(weatherCondition);

    if (isRainy) {
      const message = `Due to rainy weather (${weatherCondition}) in ${CITY}, all classes are cancelled today. Please stay safe.`;

      console.log('Rain detected! Creating cancellation notification.');

      const notification = new Notification({
        title: 'Classes Cancelled Due to Weather',
        message: message,
        type: 'warning',
        isRead: false,
      });

      await notification.save();
      console.log('Cancellation notification saved successfully.');
      return { notified: true, condition: weatherCondition };
    } else {
      console.log('Weather is clear. No notification needed.');
      return { notified: false, condition: weatherCondition };
    }
  } catch (error) {
    if (error.response) {
      console.error('Error fetching weather data:', error.response.status, error.response.data.message);
      throw new Error(`Weather API error: ${error.response.data.message}`);
    } else {
      console.error('An unexpected error occurred in the weather checker:', error.message);
      throw error;
    }
  }
}

export default checkWeatherAndNotify;
