# Guide de Déploiement

## Option 1: Railway (Recommandé)
1. Créer un compte sur railway.app
2. Connecter votre repo GitHub
3. Déployer le dossier `backend/`
4. Ajouter les variables d'environnement :
   - `MONGODB_URI`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
   - `NODE_ENV=production`

## Option 2: Render
1. Créer un compte sur render.com
2. Nouveau "Web Service"
3. Connecter le repo, dossier `backend/`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Ajouter les variables d'environnement

## Option 3: Heroku
1. Créer une app Heroku
2. `git subtree push --prefix backend heroku main`
3. Configurer les variables d'environnement
4. Ajouter MongoDB Atlas

## Frontend sur Netlify
1. Connecter le repo GitHub
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Variables d'environnement:
   - `VITE_API_URL=https://votre-backend-url.com`

## Variables d'environnement Backend
```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
ADMIN_EMAIL=admin@buildium.ma
ADMIN_PASSWORD_HASH=$2b$12$...
JWT_SECRET=votre_secret_super_securise
```

## Variables d'environnement Frontend
```
VITE_API_URL=https://votre-backend-railway.up.railway.app
```