# Étape de build
FROM node:20-alpine AS build
 
# Installation de pnpm
RUN npm install -g pnpm
 
# Définir le répertoire de travail
WORKDIR /app
 
# Argument de build pour l'URL de l'API
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL
 
# Copier tous les fichiers (le .dockerignore exclura node_modules, dist, etc.)
COPY . .

# Vérifier que les fichiers critiques existent AVANT l'installation
RUN test -f /app/src/lib/format.ts || (echo "ERROR: format.ts not found" && echo "=== Contenu de /app ===" && ls -la /app/ && echo "=== Contenu de /app/src ===" && ls -la /app/src/ 2>/dev/null || echo "src not found" && exit 1)
 
# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Construire l'application pour la production
RUN pnpm build
 
# Étape de production
FROM nginx:alpine
 
# Créer un fichier de configuration nginx personnalisé pour gérer les routes SPA et proxy API
RUN rm -rf /etc/nginx/conf.d/*
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compression gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   
    # Proxy pour les requêtes API vers le backend
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
   
    # Ne pas mettre en cache les fichiers HTML
    location ~* \.(?:html)$ {
        expires -1;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    }
   
    # Mettre en cache les ressources statiques
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
   
    # Pour une Single Page Application - toutes les requêtes non-fichiers vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
 
# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html
 
# S'assurer que nginx peut accéder aux fichiers
RUN chmod -R 755 /usr/share/nginx/html
 
# Exposer le port 80
EXPOSE 80
 
# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]