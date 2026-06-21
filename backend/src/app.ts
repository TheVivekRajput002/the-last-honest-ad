import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Route imports
import adsRouter from './routes/ads.routes';
import categoriesRouter from './routes/categories.routes';
import galleryRouter from './routes/gallery.routes';
import leaderboardRouter from './routes/leaderboard.routes';
import usersRouter from './routes/users.routes';

// Mount Routes
app.use('/api/ads', adsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/users', usersRouter);

// Centralized Error Handling
app.use(errorHandler);

export default app;
