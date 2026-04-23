const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin not allowed — ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

app.use('/auth',  require('./routes/auth'));
app.use('/',      require('./routes/license'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('─────────────────────────────────────────────');
  console.log(`  Arms License API  →  http://localhost:${PORT}`);
  console.log('─────────────────────────────────────────────');
  console.log('  POST   /auth/login');
  console.log('  POST   /auth/create-user  (admin)');
  console.log('  GET    /verify/:cnic      (public)');
  console.log('  POST   /license           (admin/operator)');
  console.log('  PUT    /license/:id       (admin/operator)');
  console.log('  GET    /licenses          (admin)');
  console.log('  DELETE /license/:id       (admin)');
  console.log('─────────────────────────────────────────────');
});
