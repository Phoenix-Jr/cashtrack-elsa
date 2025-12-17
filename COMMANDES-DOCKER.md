# Commandes Docker pour construire les conteneurs individuellement

## IMPORTANT : Assurez-vous d'être dans le répertoire racine du projet

Vérifiez que vous êtes dans le bon répertoire :
```bash
cd C:\Users\hp\Desktop\CashTrack
# ou le chemin où se trouve docker-compose.yml
```

## Construire le backend

```bash
docker build --platform linux/amd64 -t cash-track-backend:latest -f cash-track-backend/Dockerfile cash-track-backend
```

**Alternative avec buildx (si la commande ci-dessus ne fonctionne pas) :**
```bash
docker buildx build --platform linux/amd64 -t cash-track-backend:latest -f cash-track-backend/Dockerfile cash-track-backend --load
```

## Construire le frontend

```bash
docker build --platform linux/amd64 --build-arg VITE_API_URL=http://localhost:8000/api -t cash-track-frontend:latest -f cash-track-react/Dockerfile cash-track-react
```

**Alternative avec buildx :**
```bash
docker buildx build --platform linux/amd64 --build-arg VITE_API_URL=http://localhost:8000/api -t cash-track-frontend:latest -f cash-track-react/Dockerfile cash-track-react --load
```

## Télécharger l'image PostgreSQL

```bash
docker pull --platform linux/amd64 postgres:15-alpine
```

## Vérifier les images construites

```bash
docker images | findstr cash-track
```

## Résolution de problèmes

### Erreur "no matching manifest"
1. Vérifiez que Docker Desktop utilise Linux containers (pas Windows containers)
2. Activez WSL 2 dans Docker Desktop : Settings > General > "Use the WSL 2 based engine"
3. Essayez avec `docker buildx` au lieu de `docker build`

### Erreur "file not found" ou "path not found"
- Assurez-vous d'être dans le répertoire racine (où se trouve `docker-compose.yml`)
- Vérifiez que les chemins `cash-track-backend` et `cash-track-react` existent

### Activer buildx (si nécessaire)
```bash
docker buildx create --use --name multiplatform
docker buildx inspect --bootstrap
```

### Vérifier la plateforme Docker
```bash
docker version
docker info
```

## Exécuter les conteneurs individuellement (optionnel)

### PostgreSQL
```bash
docker run -d --name cash-track-db --platform linux/amd64 -e POSTGRES_DB=cashtrack -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=hFVfTS14lzFN81qPHX4 -p 5432:5432 postgres:15-alpine
```

### Backend
```bash
docker run -d --name cash-track-backend --platform linux/amd64 -p 8000:8000 -e DEBUG=True -e DJANGO_SETTINGS_MODULE=cash_track_api.settings -e DB_ENGINE=postgresql -e POSTGRES_DB=cashtrack -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=hFVfTS14lzFN81qPHX4 -e POSTGRES_HOST=host.docker.internal -e POSTGRES_PORT=5432 cash-track-backend:latest
```

### Frontend
```bash
docker run -d --name cash-track-frontend --platform linux/amd64 -p 80:80 cash-track-frontend:latest
```

