# Front of Intergee, served by Caddy with automatic HTTPS (ADR 0008 of the API repository)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# Same origin as in development: Caddy forwards /api to the API
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
