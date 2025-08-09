## Buildium - Gestion et génération de factures (React + Node + MongoDB)

### Prérequis
- Node.js 18+
- Un cluster MongoDB Atlas (URI)

### Structure
- `backend/` API Express, génération PDF, MongoDB
- `frontend/` Application React (Vite)

### Démarrage rapide
1. Backend
   - Copier `backend/.env.example` vers `backend/.env` et renseigner `MONGODB_URI` et éventuellement `PORT`
   - Installer les dépendances: `cd backend && npm install`
   - Lancer en dev: `npm run dev`
   - L’API écoute par défaut sur `http://localhost:4000`

2. Frontend
   - Copier `frontend/.env.example` vers `frontend/.env` et définir `VITE_API_URL` (ex: `http://localhost:4000`)
   - Installer les dépendances: `cd frontend && npm install`
   - Lancer: `npm run dev`
   - L’UI écoute par défaut sur `http://localhost:5173`

### Endpoints API
- `GET /invoices` — liste les factures
- `POST /invoices` — crée une facture, génère le PDF et l’enregistre
- `GET /invoices/:id/pdf` — renvoie le PDF de la facture
- Fichiers PDF statiques: `/static/pdfs/<filename>.pdf`

### Modèle d’émetteur (fixe)
- Nom: BUILDIUM S.A.R.L
- ICE: 003255241000096
- RC: Tanger N° 137203
- Id. fiscale: 53738133
- Adresse: RTE TETOUAN, NICE CENTER ET4 N20, TANGER
- Téléphone: +212 6 61 34 35 83
- Email: Contact@buildium.ma

### Notes
- Le numéro de facture est généré sous la forme `INV-YYYYMMDD-XXX`.
- Le bouton "Aperçu" du frontend affiche un rendu HTML avant l’envoi pour génération PDF.