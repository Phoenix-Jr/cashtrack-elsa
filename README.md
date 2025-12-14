# CashTrack - Gestion de Caisse Professionnelle

Application complète de gestion de caisse avec backend Django REST Framework et frontend React.

## Structure du projet

```
CashTrack/
├── cash-track-backend/    # Backend Django REST Framework
│   ├── accounts/          # Gestion des utilisateurs
│   ├── categories/        # Gestion des catégories
│   ├── transactions/     # Gestion des transactions
│   └── cash_track_api/   # Configuration Django
│
├── cash-track-react/     # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'application
│   │   ├── hooks/        # Hooks React Query
│   │   ├── services/     # Services API
│   │   └── lib/          # Utilitaires
│   └── public/           # Assets statiques
│
├── docker-compose.yml    # Configuration Docker
└── README.md            # Ce fichier
```

## Technologies utilisées

### Backend
- Django 4.x
- Django REST Framework
- SQLite (développement) / PostgreSQL (production)
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Vite
- React Query
- Tailwind CSS
- shadcn/ui

## Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- pnpm (ou npm/yarn)

### Backend

```bash
cd cash-track-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd cash-track-react
pnpm install
pnpm dev
```

## Utilisation

1. Démarrer le backend sur `http://localhost:8000`
2. Démarrer le frontend sur `http://localhost:5173`
3. Accéder à l'application via le navigateur

## Fonctionnalités

- ✅ Gestion des transactions (recettes/dépenses)
- ✅ Gestion des catégories
- ✅ Gestion des utilisateurs avec rôles
- ✅ Tableau de bord avec statistiques
- ✅ Rapports Excel
- ✅ Export de données
- ✅ Authentification JWT
- ✅ Pagination
- ✅ Recherche et filtres

## Développement

### Générer des données de test

```bash
cd cash-track-backend
python manage_data.py
```

### Docker

```bash
docker-compose up -d
```

## Licence

Propriétaire

