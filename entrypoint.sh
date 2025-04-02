#!/bin/sh

echo "⏳ Waiting for database..."
until nc -z postgres 5432; do
  echo "❗ DB not ready, retrying in 2s..."
  sleep 2
done

echo "✅ Database ready"

npx prisma migrate deploy
exec node dist/src/main
