# 🌐 DÉPLOIEMENT NETLIFY (100% Gratuit, Sans CB)

## 🚀 SOLUTION: Netlify Functions + Frontend

### 📋 Prérequis
- Compte GitHub
- Compte Netlify (gratuit, sans CB)

## 🔧 ÉTAPE 1: Préparer pour Netlify Functions

### 1.1 Structure requise
```
frontend/
├── netlify/
│   └── functions/
│       └── api.js
├── netlify.toml
└── ...
```

### 1.2 Configuration Netlify
Le fichier `netlify.toml` est déjà créé ✅

## 🌐 ÉTAPE 2: Déployer sur Netlify

### 2.1 Déploiement
1. Aller sur [netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Connecter GitHub → Sélectionner votre repo
4. **Configuration:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

### 2.2 Variables d'environnement
Dans Netlify Dashboard → Site settings → Environment variables:
```
VITE_API_URL=https://votre-site.netlify.app/.netlify/functions
MONGODB_URI=mongodb+srv://greatstockdel:2112004@cluster0.eprsdja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ADMIN_EMAIL=admin@buildium.ma
ADMIN_PASSWORD_HASH=$2b$12$waQKMt/VO5gmX7MoFnhFiOM.aTvubhbL6ZOxAv16MjJH/bxEn.rKy
JWT_SECRET=buildium_super_secret_key_2024_change_in_production
NODE_ENV=production
```

## ✅ Avantages Netlify
- ✅ **Aucune carte bancaire** requise
- ✅ **Tout sur une plateforme**
- ✅ **HTTPS** automatique
- ✅ **Déploiement** automatique
- ✅ **100GB bandwidth/mois** gratuit
- ✅ **125k requêtes/mois** functions

## 🎯 Limites Netlify Gratuit
- 100GB bandwidth/mois
- 125,000 requêtes functions/mois
- 10s timeout functions

**PARFAIT POUR VOTRE APP !** 🎉

## 🚀 URL Finale
Votre app sera accessible sur: `https://buildium-app.netlify.app`