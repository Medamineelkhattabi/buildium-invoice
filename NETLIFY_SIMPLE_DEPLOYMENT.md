# 🌐 DÉPLOIEMENT NETLIFY SIMPLE (100% Gratuit)

## 🚀 SOLUTION RECOMMANDÉE : Netlify Functions

Vercel pose des problèmes avec Express. Netlify est plus stable.

## 📋 ÉTAPE 1: Préparer Netlify Functions

### 1.1 Structure déjà prête ✅
```
frontend/
├── netlify/
│   └── functions/
│       └── api.js
├── netlify.toml
└── ...
```

## 🌐 ÉTAPE 2: Déployer sur Netlify

### 2.1 Déploiement
1. **Aller sur [netlify.com](https://netlify.com)**
2. **"Add new site" → "Import from Git"**
3. **Connecter GitHub** → Sélectionner votre repo
4. **Configuration:**
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`

### 2.2 Variables d'environnement
Dans Netlify Dashboard → Site settings → Environment variables:

**IMPORTANT: Ajouter TOUTES ces variables :**
```
VITE_API_URL=https://buildium-invoice.netlify.app/.netlify/functions
MONGODB_URI=mongodb+srv://greatstockdel:2112004@cluster0.eprsdja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ADMIN_EMAIL=admin@buildium.ma
ADMIN_PASSWORD_HASH=$2b$12$waQKMt/VO5gmX7MoFnhFiOM.aTvubhbL6ZOxAv16MjJH/bxEn.rKy
JWT_SECRET=buildium_super_secret_key_2024_change_in_production
NODE_ENV=production
```

## 🎯 URLs après déploiement

**Frontend:** `https://votre-site.netlify.app`
**API:** `https://votre-site.netlify.app/.netlify/functions/api`

## ✅ Avantages Netlify

- ✅ **Aucune carte bancaire** requise
- ✅ **Tout sur une plateforme**
- ✅ **Plus stable** que Vercel pour Express
- ✅ **HTTPS** automatique
- ✅ **100GB bandwidth/mois** gratuit
- ✅ **125k requêtes functions/mois**

## 🚀 Test après déploiement

**1. Frontend:** `https://votre-site.netlify.app`
**2. API Health:** `https://votre-site.netlify.app/.netlify/functions/api/health`
**3. Login:** `https://votre-site.netlify.app/.netlify/functions/api/auth/login`

## 🎉 BEAUCOUP PLUS SIMPLE QUE VERCEL !

Netlify gère mieux Express et les dépendances complexes.