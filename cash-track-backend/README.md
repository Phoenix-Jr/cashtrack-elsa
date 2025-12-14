# Cash Track API - Backend Django

Backend API pour l'application Cash Track utilisant Django et Django REST Framework.

## Installation

1. Créer et activer l'environnement virtuel :
```bash
python -m venv cash-track-backend-env
# Windows
cash-track-backend-env\Scripts\activate
# Linux/Mac
source cash-track-backend-env/bin/activate
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Créer les migrations et migrer :
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Créer les données initiales :
```bash
python manage_data.py
```

5. Créer un superutilisateur (optionnel) :
```bash
python manage.py createsuperuser
```

6. Lancer le serveur :
```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://localhost:8000`

## Endpoints API

### Authentification
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/refresh/` - Rafraîchir le token
- `POST /api/auth/logout/` - Déconnexion
- `GET /api/auth/me/` - Utilisateur actuel

### Transactions
- `GET /api/transactions/` - Liste des transactions
- `POST /api/transactions/` - Créer une transaction
- `GET /api/transactions/{id}/` - Détails d'une transaction
- `PUT /api/transactions/{id}/` - Modifier une transaction
- `DELETE /api/transactions/{id}/` - Supprimer une transaction
- `GET /api/transactions/stats/` - Statistiques
- `GET /api/transactions/dashboard-stats/` - Statistiques dashboard

### Catégories
- `GET /api/categories/` - Liste des catégories
- `POST /api/categories/` - Créer une catégorie
- `GET /api/categories/{id}/` - Détails d'une catégorie
- `PUT /api/categories/{id}/` - Modifier une catégorie
- `DELETE /api/categories/{id}/` - Supprimer une catégorie

### Utilisateurs (Admin uniquement)
- `GET /api/auth/users/` - Liste des utilisateurs
- `POST /api/auth/users/` - Créer un utilisateur
- `GET /api/auth/users/{id}/` - Détails d'un utilisateur
- `PUT /api/auth/users/{id}/` - Modifier un utilisateur
- `DELETE /api/auth/users/{id}/` - Supprimer un utilisateur

## Comptes de test

Après avoir exécuté `manage_data.py`, vous pouvez vous connecter avec :
- Admin: `admin@example.com` / `admin123`
- Manager: `manager@example.com` / `manager123`
- User: `user@example.com` / `user123`

## Authentification JWT

L'API utilise JWT pour l'authentification. Incluez le token dans les en-têtes :
```
Authorization: Bearer <access_token>
```

Le token d'accès expire après 1 heure. Utilisez le refresh token pour obtenir un nouveau token d'accès.

# cash-track-backend
