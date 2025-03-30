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
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --only=production
EXPOSE 4000
CMD ["node", "dist/src/main"]