# Stage 1: build NestJS
FROM node:22-alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

# Stage 2: run production
FROM node:22-alpine
WORKDIR /app

# Copy built app and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint
#test
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN npm install --only=production
EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]
