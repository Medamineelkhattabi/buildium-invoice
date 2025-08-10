// Test simple pour Vercel
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API Vercel fonctionne',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}