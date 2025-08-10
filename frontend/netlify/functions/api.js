// Netlify Function qui proxy vers votre backend
import express from 'express';
import serverless from 'serverless-http';

// Importer votre app backend
import app from '../../../backend/src/server.js';

// Wrapper pour Netlify Functions
const handler = serverless(app);

export { handler };