import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from './config/database.js';
import invoicesRouter from './routes/invoices.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Static serve generated PDFs
app.use('/static/pdfs', express.static(path.join(__dirname, '..', 'storage', 'pdfs')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/invoices', invoicesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });