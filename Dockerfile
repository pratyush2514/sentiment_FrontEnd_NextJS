FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG MOCK_AUTH=false
ARG BACKEND_URL=https://backend.invalid
ARG BACKEND_API_TOKEN=container-token
ARG SESSION_SECRET=container-session-secret
ARG NEXT_PUBLIC_APP_URL=https://pulseboard.example.com
ARG SLACK_CLIENT_ID=container-slack-client-id
ARG SLACK_CLIENT_SECRET=container-slack-client-secret
ENV MOCK_AUTH=$MOCK_AUTH
ENV BACKEND_URL=$BACKEND_URL
ENV BACKEND_API_TOKEN=$BACKEND_API_TOKEN
ENV SESSION_SECRET=$SESSION_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV SLACK_CLIENT_ID=$SLACK_CLIENT_ID
ENV SLACK_CLIENT_SECRET=$SLACK_CLIENT_SECRET
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
