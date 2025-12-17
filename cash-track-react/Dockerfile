# Étape de build
FROM node:20-alpine AS build
 
# Installation de pnpm
RUN npm install -g pnpm
 
# Définir le répertoire de travail
WORKDIR /app
 
# Argument de build pour l'URL de l'API
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL
 
# Copier les fichiers de configuration
COPY package.json pnpm-lock.yaml* ./
 
# Installer les dépendances
RUN pnpm install --frozen-lockfile
 
# Copier le reste du code source (inclut src, public, configs, etc.)
COPY . .
 
# Construire l'application pour la production
RUN pnpm build
 
# Étape de production
FROM nginx:alpine
 
# Créer un fichier de configuration nginx personnalisé pour gérer les routes SPA
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