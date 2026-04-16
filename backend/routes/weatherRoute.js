import { Router } from 'express';
import checkWeatherAndNotify from '../utils/weatherCheck.js';

const weatherRouter = Router();

// GET /api/weather-check
// Called daily by Vercel Cron at 7:00 AM IST (01:30 UTC)
weatherRouter.get('/', async (req, res) => {
  try {
    const result = await checkWeatherAndNotify();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Weather check route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default weatherRouter;
