# 🚀 DÉPLOIEMENT VERCEL (100% Gratuit, Sans CB)

## 📋 Prérequis
- Compte GitHub
- Compte Vercel (gratuit, sans CB)

## 🔧 ÉTAPE 1: Préparer le Backend pour Vercel

### 1.1 Structure Vercel
Le backend est déjà configuré avec `vercel.json` ✅

### 1.2 Adapter le serveur pour Vercel
Créer `backend/api/index.js` (point d'entrée Vercel):

## 🌐 ÉTAPE 2: Déployer sur Vercel

### 2.1 Backend
1. Aller sur [vercel.com](https://vercel.com)
2. "New Project" → Connecter GitHub
3. Sélectionner votre repo
4. **Root Directory: `backend`**
5. Variables d'environnement:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://greatstockdel:2112004@cluster0.eprsdja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ADMIN_EMAIL=admin@buildium.ma
   ADMIN_PASSWORD_HASH=$2b$12$waQKMt/VO5gmX7MoFnhFiOM.aTvubhbL6ZOxAv16MjJH/bxEn.rKy
   JWT_SECRET=buildium_super_secret_key_2024_change_in_production
   ```
6. **Deploy** → URL: `https://buildium-backend.vercel.app`

### 2.2 Frontend
1. **Nouveau projet** Vercel
2. **Root Directory: `frontend`**
3. Variables d'environnement:
   ```
   VITE_API_URL=https://buildium-invoice.vercel.app
   ```
4. **Deploy** → URL: `https://buildium-app.vercel.app`

## ✅ Avantages Vercel
- ✅ **Aucune carte bancaire** requise
- ✅ **Serverless** (pas de veille)
- ✅ **Performance** excellente
- ✅ **HTTPS** automatique
- ✅ **Déploiement** automatique via Git
- ✅ **100GB bandwidth/mois** gratuit

## 🎯 Limites Vercel Gratuit
- 100GB bandwidth/mois (largement suffisant)
- 100 déploiements/jour
- Fonctions serverless (10s timeout)

**PARFAIT POUR VOTRE APP !** 🎉