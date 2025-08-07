import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import NotificationRouter from './routes.js/notifications.js';
import UiRouter from './routes.js/ui.js';


const app = express();
const PORT = process.env.PORT || 5000;
// Parse comma-separated list of allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow
    } else {
      callback(new Error('Not allowed by CORS')); // Block
    }
  }
};

app.use(cors(corsOptions));

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(NotificationRouter);
app.use(UiRouter);
await connectDB();


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
