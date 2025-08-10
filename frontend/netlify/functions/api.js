// Netlify Function avec Express
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from '../../../backend/src/config/database.js';
import invoicesRouter from '../../../backend/src/routes/invoices.routes.js';
import authRouter from '../../../backend/src/routes/auth.routes.js';
import { authenticate } from '../../../backend/src/middleware/auth.js';

dotenv.config();

const app = express();

// CORS
app.use(cors({ 
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Buildium API Netlify',
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
    message: err.message || 'Internal Server Error'
  });
});

// Connexion DB
connectToDatabase().catch(console.error);

// Export pour Netlify
const handler = serverless(app);
export { handler };