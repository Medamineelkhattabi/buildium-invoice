# 🔧 CORRECTION NETLIFY

## 🚨 Erreur "vite: not found"

### ✅ Correction appliquée :

**Problème :** Netlify n'installait pas les dépendances avant le build.

**Solution :** Changé la commande de build dans `netlify.toml` :
```
command = "npm install && npm run build"
```

## 🚀 Actions à faire :

### 1. Redéployer sur Netlify
- Commitez et pushez les changements
- Netlify redéploiera automatiquement
- OU cliquez "Trigger deploy" dans le dashboard

### 2. Vérifier la configuration Netlify
Dans le dashboard Netlify → Site settings → Build & deploy :
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

### 3. Variables d'environnement requises
```
VITE_API_URL=https://votre-site.netlify.app/.netlify/functions/api
MONGODB_URI=mongodb+srv://greatstockdel:2112004@cluster0.eprsdja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ADMIN_EMAIL=admin@buildium.ma
ADMIN_PASSWORD_HASH=$2b$12$waQKMt/VO5gmX7MoFnhFiOM.aTvubhbL6ZOxAv16MjJH/bxEn.rKy
JWT_SECRET=buildium_super_secret_key_2024_change_in_production
NODE_ENV=production
```

## ✅ Le build devrait maintenant fonctionner !

Après le redéploiement, votre app sera accessible sur `https://votre-site.netlify.app`