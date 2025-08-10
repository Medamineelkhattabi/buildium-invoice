# 🔍 DEBUG VERCEL

## 🚨 Erreur 500 persistante

### 📋 Tests à faire après redéploiement :

**1. Test API de base :**
```
GET https://buildium-invoice.vercel.app/
```
**Doit retourner :** Message de bienvenue

**2. Test santé :**
```
GET https://buildium-invoice.vercel.app/health
```
**Doit retourner :** `{"status":"ok"}`

**3. Test endpoint simple :**
```
GET https://buildium-invoice.vercel.app/api/test
```
**Doit retourner :** Message de test

**4. Test login :**
```
POST https://buildium-invoice.vercel.app/auth/login
Content-Type: application/json

{
  "email": "admin@buildium.ma",
  "password": "buildium2024"
}
```

### 🔧 Si ça ne marche toujours pas :

**Option 1: Vérifier les logs Vercel**
- Dashboard → Project → Functions → View Function Logs

**Option 2: Variables d'environnement**
Vérifier que toutes les variables sont bien configurées :
- `NODE_ENV=production`
- `MONGODB_URI=...`
- `ADMIN_EMAIL=admin@buildium.ma`
- `ADMIN_PASSWORD_HASH=...`
- `JWT_SECRET=...`

**Option 3: Problème MongoDB**
- Vérifier que l'IP 0.0.0.0/0 est autorisée dans MongoDB Atlas
- Tester la connexion DB

### 🎯 Solution alternative : Netlify

Si Vercel continue à poser problème, utilisez Netlify Functions :

1. Déployez seulement le frontend sur Netlify
2. Le backend sera dans `netlify/functions/`
3. Plus simple et plus stable

## 📞 Prochaines étapes :

1. **Redéployez** avec les corrections
2. **Testez** les endpoints un par un
3. **Vérifiez** les logs Vercel
4. **Si échec** → Basculer sur Netlify