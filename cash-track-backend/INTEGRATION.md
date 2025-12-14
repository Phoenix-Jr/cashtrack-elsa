# Guide d'intégration Frontend-Backend

## Démarrage du backend

1. Activer l'environnement virtuel :
```bash
cd cash-track-backend
../cash-track-backend-env/Scripts/activate  # Windows
# ou
source ../cash-track-backend-env/bin/activate  # Linux/Mac
```

2. Lancer le serveur Django :
```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://localhost:8000`

## Démarrage du frontend

1. Dans le dossier `cash-track-react` :
```bash
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Configuration

Assurez-vous que le fichier `.env` dans `cash-track-react` contient :
```
VITE_API_URL=http://localhost:8000/api
```

## Comptes de test

- **Admin**: `admin@example.com` / `admin123`
- **Manager**: `manager@example.com` / `manager123`
- **User**: `user@example.com` / `user123`

## Endpoints disponibles

### Authentification
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/refresh/` - Rafraîchir le token
- `POST /api/auth/logout/` - Déconnexion
- `GET /api/auth/me/` - Utilisateur actuel

### Transactions
- `GET /api/transactions/` - Liste (avec filtres: type, category, author, date_from, date_to, amount_min, amount_max, search)
- `POST /api/transactions/` - Créer
- `GET /api/transactions/{id}/` - Détails
- `PUT /api/transactions/{id}/` - Modifier
- `DELETE /api/transactions/{id}/` - Supprimer
- `GET /api/transactions/stats/` - Statistiques
- `GET /api/transactions/dashboard-stats/` - Statistiques dashboard

### Catégories
- `GET /api/categories/` - Liste
- `POST /api/categories/` - Créer
- `GET /api/categories/{id}/` - Détails
- `PUT /api/categories/{id}/` - Modifier
- `DELETE /api/categories/{id}/` - Supprimer

### Utilisateurs (Admin uniquement)
- `GET /api/auth/users/` - Liste
- `POST /api/auth/users/` - Créer
- `GET /api/auth/users/{id}/` - Détails
- `PUT /api/auth/users/{id}/` - Modifier
- `DELETE /api/auth/users/{id}/` - Supprimer

## Authentification JWT

Toutes les requêtes (sauf login et refresh) nécessitent un token JWT dans l'en-tête :
```
Authorization: Bearer <access_token>
```

Le token d'accès expire après 1 heure. Le client gère automatiquement le rafraîchissement avec le refresh token.

