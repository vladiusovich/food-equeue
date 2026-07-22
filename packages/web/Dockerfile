ARG NODE_VERSION=22.12

FROM node:${NODE_VERSION}-alpine AS build

# PUBLIC_FOOD_SERVER_URL and PUBLIC_FOOD_SERVER_SOCKET_URL are read via
# $env/static/public, which SvelteKit inlines at build time — so they must
# be passed as --build-arg, not as runtime `docker run -e` / compose env.
ARG PUBLIC_FOOD_SERVER_URL
ARG PUBLIC_FOOD_SERVER_SOCKET_URL
ENV PUBLIC_FOOD_SERVER_URL=${PUBLIC_FOOD_SERVER_URL}
ENV PUBLIC_FOOD_SERVER_SOCKET_URL=${PUBLIC_FOOD_SERVER_SOCKET_URL}

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies (reproducible install from lockfile)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the static SvelteKit site (adapter-static)
RUN npm run build

# Stage 2: serve the static site
FROM nginx:1.27-alpine AS prod

# SPA fallback: unknown paths resolve to index.html, client-side router takes over
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
