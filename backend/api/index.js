// Point d'entrée pour Vercel Serverless
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from '../src/config/database.js';
import invoicesRouter from '../src/routes/invoices.routes.js';
import authRouter from '../src/routes/auth.routes.js';
import { authenticate } from '../src/middleware/auth.js';

dotenv.config();

const app = express();

// CORS
app.use(cors({ 
  origin: [
    'https://buildium-invoice-yene.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Buildium API Vercel',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes API
app.use('/auth', authRouter);
app.use('/invoices', authenticate, invoicesRouter);

// Gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error',
    stack: err.stack
  });
});

// Connexion DB
connectToDatabase().catch(console.error);

export default app;