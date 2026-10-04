import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./libs/db.js";

import { authenticateToken } from "./middlewares/auth.middleware.js";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import nannyRouter from "./routes/nanny.route.js";
import institutionRouter from "./routes/institution.route.js";
import daycareRouter from "./routes/daycare.route.js";
import addressRouter from "./routes/address.route.js";
import geocodeRouter from "./routes/geocode.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await db.runtime();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: (error as Error).message,
    });
  }
});

app.use("/api/auth", authRouter);

app.use(authenticateToken);

app.use("/api/nannies", nannyRouter);

app.use("/api/user", userRouter);

app.use("/api/institutions", institutionRouter);
app.use("/api/daycares", daycareRouter);
app.use("/api/addresses", addressRouter);

app.use("/api/geocode", geocodeRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint does not exist" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start the server
console.log(`Starting the server and connecting to the database...`);
await db.connect();
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
  console.log(
    `Health check endpoint available at http://localhost:${PORT}/api/health`,
  );
});
