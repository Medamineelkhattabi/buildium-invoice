import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from './config/database.js';
import invoicesRouter from './routes/invoices.routes.js';
import authRouter from './routes/auth.routes.js';
import { authenticate } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://buildium-invoice-yene.vercel.app',
        'https://buildium-app.netlify.app', 
        'http://localhost:5173'
      ]
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Static serve generated PDFs
app.use('/static/pdfs', express.static(path.join(__dirname, 'storage', 'pdfs')));
app.use('/static/exports', express.static(path.join(__dirname, 'storage', 'exports')));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Buildium API is running',
    status: 'ok',
    endpoints: {
      auth: '/auth/login',
      invoices: '/invoices',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/invoices', authenticate, invoicesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Connexion à la base de données
connectToDatabase().catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Pour le développement local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

// Export pour Vercel
export default app;