import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initializeDatabase from './utils/initDb.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

// Middleware - order is important
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running'
  });
});

app.use('/api/auth', authRoutes);

// Error handler middleware - must be last
app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
