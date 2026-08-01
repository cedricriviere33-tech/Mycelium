FROM nginx:alpine

# Copie tout le contenu du dépôt dans le dossier servi par nginx
COPY . /usr/share/nginx/html

# Si aucun index.html n'existe, utilise le fichier principal comme page d'accueil
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
      if [ -f /usr/share/nginx/html/mycelium.html ]; then \
        cp /usr/share/nginx/html/mycelium.html /usr/share/nginx/html/index.html; \
      elif [ -f /usr/share/nginx/html/famille.html ]; then \
        cp /usr/share/nginx/html/famille.html /usr/share/nginx/html/index.html; \
      fi; \
    fi

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
