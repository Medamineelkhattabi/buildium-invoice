# Guide de Déploiement GRATUIT

## 🆓 Option 1: Render (100% Gratuit)
**Backend sur Render (Gratuit permanent)**
1. Créer un compte sur render.com
2. "New" → "Web Service"
3. Connecter GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**
5. Variables d'environnement:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://...
   ADMIN_EMAIL=admin@buildium.ma
   ADMIN_PASSWORD_HASH=$2b$12$...
   JWT_SECRET=votre_secret_securise
   ```

**Limitations Render gratuit:**
- Se met en veille après 15min d'inactivité
- Redémarre en ~30 secondes au premier accès
- 750h/mois (largement suffisant)

## 🆓 Option 2: Vercel (Backend + Frontend)
**Backend sur Vercel (Serverless gratuit)**
1. Créer `backend/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "src/server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "/src/server.js" }]
   }
   ```
2. Déployer sur vercel.com
3. Variables d'environnement dans dashboard Vercel

**Frontend sur Vercel:**
- Même repo, dossier `frontend`
- Build automatique

## 🆓 Option 3: Netlify Functions (Recommandé)
**Backend en Netlify Functions (Gratuit permanent)**

### Étape 1: Restructurer pour Netlify Functions