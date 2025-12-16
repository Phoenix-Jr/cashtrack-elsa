# Configuration PostgreSQL avec Docker

Ce projet utilise maintenant PostgreSQL comme base de données, même dans Docker.

## Configuration

### Docker Compose

Le fichier `docker-compose.yml` inclut maintenant un service PostgreSQL :

- **Image**: `postgres:16-alpine`
- **Base de données**: `cashtrack`
- **Utilisateur**: `postgres`
- **Mot de passe**: `postgres` (à changer en production)
- **Port**: `5432`

### Variables d'environnement

Le backend utilise des variables d'environnement pour la configuration de la base de données :

- `DB_ENGINE=postgresql` : Active PostgreSQL
- `POSTGRES_DB=cashtrack` : Nom de la base de données
- `POSTGRES_USER=postgres` : Utilisateur PostgreSQL
- `POSTGRES_PASSWORD=postgres` : Mot de passe
- `POSTGRES_HOST=db` : Host (dans Docker) ou `localhost` (local)
- `POSTGRES_PORT=5432` : Port PostgreSQL

### Démarrage avec Docker

```bash
# Démarrer tous les services (DB, Backend, Frontend)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Développement local (sans Docker)

Pour utiliser PostgreSQL en local sans Docker :

1. Installer PostgreSQL sur votre machine
2. Créer une base de données :
   ```sql
   CREATE DATABASE cashtrack;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE cashtrack TO postgres;
   ```

3. Créer un fichier `.env` dans `cash-track-backend/` :
   ```env
   DB_ENGINE=postgresql
   POSTGRES_DB=cashtrack
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

4. Lancer les migrations :
   ```bash
   cd cash-track-backend
   python manage.py migrate
   ```

### Fallback SQLite

Si les variables d'environnement PostgreSQL ne sont pas définies, le système utilise automatiquement SQLite pour le développement local.

### Migration des données

Si vous avez des données dans SQLite et voulez les migrer vers PostgreSQL :

1. Exporter les données depuis SQLite :
   ```bash
   python manage.py dumpdata > data.json
   ```

2. Configurer PostgreSQL (voir ci-dessus)

3. Importer les données :
   ```bash
   python manage.py loaddata data.json
   ```

### Sécurité en production

⚠️ **Important** : Changez les mots de passe par défaut en production !

1. Utilisez des variables d'environnement sécurisées
2. Ne commitez jamais les fichiers `.env` avec des mots de passe réels
3. Utilisez des secrets managers pour la production

