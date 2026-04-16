import express from "express";
import dotenv from "dotenv";
import dbConnect from "./utils/dbConnect.js";
import cors from "cors";

import coursesRouter from "./routes/coursesRoute.js";
import facultyRouter from "./routes/facultyRoute.js";
import roomsRouter from "./routes/roomsRoute.js";
import timetablesRouter from "./routes/timetableRoute.js";
import aiRouter from "./routes/aiRoute.js";
import notificationsRouter from "./routes/notificationsRoute.js";
import weatherRouter from "./routes/weatherRoute.js";

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());
app.use(cors());

// Connect to database
dbConnect();

// API routes
app.use("/api/courses", coursesRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/timetables", timetablesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/weather-check", weatherRouter);

// Export app for Vercel serverless
export default app;

// Only start the HTTP server when running locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}