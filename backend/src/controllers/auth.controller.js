import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'buildium_secret';
const ADMIN_EMAIL = 'admin@buildium.ma';
const ADMIN_PASSWORD = 'buildium2024';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentative de connexion:', { email, password });
    console.log('Attendu:', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          email: ADMIN_EMAIL,
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Connexion réussie, token généré');

      res.json({
        success: true,
        token,
        user: {
          name: 'Administrateur',
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      });
    } else {
      console.log('Échec de connexion');
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};