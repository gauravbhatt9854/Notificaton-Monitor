import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import NotificationRouter from './routes.js/notifications.js';
import UiRouter from './routes.js/ui.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse comma-separated list of allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

/* ================================
   BASIC AUTH MIDDLEWARE
================================ */

const BASIC_USER = process.env.BASIC_AUTH_USER;
const BASIC_PASS = process.env.BASIC_AUTH_PASS;

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const decoded = Buffer.from(token, "base64").toString();
    const [user, pass] = decoded.split(":");

    if (user === BASIC_USER && pass === BASIC_PASS) {
      return next();
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
  return res.status(401).send("Authentication Required");
});

/* ================================ */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(NotificationRouter);
app.use(UiRouter);

await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
