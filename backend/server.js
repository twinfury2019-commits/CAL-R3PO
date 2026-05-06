const express         = require('express');
const cors            = require('cors');
const helmet          = require('helmet');
const mongoSanitize   = require('express-mongo-sanitize');
const hpp             = require('hpp');
const dotenv          = require('dotenv');
const connectDB       = require('./config/db');
const errorHandler    = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map(o => o.trim());

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin not allowed — ${origin}`));
  },
  credentials: true
}));

// Block payloads over 10kb — prevents large-body DoS attacks
app.use(express.json({ limit: '10kb' }));

// Strip $ and . from request data — blocks NoSQL injection attempts
app.use(mongoSanitize());

// Block HTTP parameter pollution (duplicate query params)
app.use(hpp());

app.use('/auth',  require('./routes/auth'));
app.use('/',      require('./routes/license'));

app.use(errorHandler);

// Catch unhandled promise rejections — prevent silent crashes
process.on('unhandledRejection', (err) => {
  console.error(`[unhandledRejection] ${err.message}`);
});

// Catch uncaught exceptions — log and exit cleanly so PM2/Render can restart
process.on('uncaughtException', (err) => {
  console.error(`[uncaughtException] ${err.message}`);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('─────────────────────────────────────────────');
  console.log(`  Arms License API  →  http://localhost:${PORT}`);
  console.log('─────────────────────────────────────────────');
});

// Close idle connections after 30 seconds — blocks slow-loris attacks
server.setTimeout(30000);
