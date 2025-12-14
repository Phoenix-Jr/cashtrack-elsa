# Guide Docker pour CashTrack

Ce guide explique comment lancer le projet CashTrack avec Docker Compose.

## Prérequis

- Docker installé sur votre machine
- Docker Compose installé (inclus avec Docker Desktop)

## Lancement du projet

### 1. Lancer tous les services

```bash
docker-compose up --build
```

Cette commande va :
- Construire les images Docker pour le backend et le frontend
- Lancer les deux services
- Créer un réseau Docker pour la communication entre les services

### 2. Lancer en arrière-plan

```bash
docker-compose up -d --build
```

### 3. Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### 4. Arrêter les services

```bash
docker-compose down
```

### 5. Arrêter et supprimer les volumes

```bash
docker-compose down -v
```

## Accès aux services

Une fois lancés, les services sont accessibles sur :

- **Frontend React** : http://localhost:5173
- **Backend Django** : http://localhost:8000
- **API** : http://localhost:8000/api

## Initialisation des données

Pour créer les données initiales (utilisateurs, catégories, transactions), exécutez :

```bash
docker-compose exec backend python manage_data.py
```

## Commandes utiles

### Accéder au shell du backend

```bash
docker-compose exec backend bash
```

### Exécuter des commandes Django

```bash
# Créer un super utilisateur
docker-compose exec backend python manage.py createsuperuser

# Faire les migrations
docker-compose exec backend python manage.py migrate

# Collecter les fichiers statiques
docker-compose exec backend python manage.py collectstatic --noinput
```

### Accéder au shell du frontend

```bash
docker-compose exec frontend sh
```

## Configuration

### Variables d'environnement

Vous pouvez créer un fichier `.env` à la racine du projet pour configurer les variables d'environnement :

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
VITE_API_URL=http://localhost:8000/api
```

## Dépannage

### Reconstruire les images

Si vous modifiez les Dockerfiles ou les dépendances :

```bash
docker-compose build --no-cache
docker-compose up
```

### Vider les volumes

Si vous voulez repartir de zéro :

```bash
docker-compose down -v
docker-compose up --build
```

### Vérifier l'état des conteneurs

```bash
docker-compose ps
```

