# 🔧 VERCEL TROUBLESHOOTING

## ❓ 404 sur l'URL Backend - C'est Normal !

### 🎯 Pourquoi le 404 ?
- Vercel serverless fonctionne différemment
- L'URL racine peut ne pas répondre
- **C'est normal et attendu !**

### ✅ Comment tester si ça marche ?

#### Test 1: Route de santé
```
https://votre-backend.vercel.app/health
```
**Réponse attendue:** `{"status":"ok"}`

#### Test 2: Route racine (après correction)
```
https://votre-backend.vercel.app/
```
**Réponse attendue:** Message d'accueil avec endpoints

#### Test 3: Login API
```
POST https://votre-backend.vercel.app/auth/login
Content-Type: application/json

{
  "email": "admin@buildium.ma",
  "password": "buildium2024"
}
```

### 🚨 Erreurs Communes

#### 1. Variables d'environnement manquantes
**Symptôme:** Erreur 500 ou connexion DB échoue
**Solution:** Vérifier toutes les variables dans Vercel Dashboard

#### 2. CORS Error
**Symptôme:** Erreur CORS dans le frontend
**Solution:** Ajouter l'URL frontend dans CORS backend

#### 3. Timeout Functions
**Symptôme:** Erreur après 10 secondes
**Solution:** Optimiser les requêtes DB

### 🔍 Debug Steps

1. **Vérifier les logs Vercel:**
   - Dashboard → Project → Functions → View Logs

2. **Tester les endpoints un par un:**
   - `/health` → API fonctionne
   - `/auth/login` → Auth fonctionne
   - `/invoices` → Données fonctionnent

3. **Vérifier MongoDB:**
   - Connexion Atlas active
   - IP autorisée (0.0.0.0/0 pour Vercel)

### ✅ Checklist Déploiement

- [ ] Backend déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Route `/health` répond
- [ ] Frontend déployé
- [ ] `VITE_API_URL` configuré
- [ ] CORS mis à jour
- [ ] Test login fonctionne

## 🎉 Si `/health` répond, votre API fonctionne !

Le 404 sur la racine n'est pas un problème. Votre frontend utilisera les vraies routes comme `/auth/login` et `/invoices`.