import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from "dotenv";
import cors from "cors";
import { db } from './libs/db.js';

import authMiddleware from './middlewares/auth.middleware.js';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await db.runtime();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: (error as Error).message
    });
  }
});

app.use('/api/auth', authRouter);

app.use(authMiddleware);

app.use('/api/user', userRouter);


app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint does not exist' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start the server
console.log(`Starting the server and connecting to the database...`);
await db.connect();
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
  console.log(`Health check endpoint available at http://localhost:${PORT}/api/health`);
});
