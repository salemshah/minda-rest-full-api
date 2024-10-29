#!/bin/sh

set -e

# Function to wait for PostgreSQL to be ready
wait_for_db() {
  echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."

  # Loop until PostgreSQL is ready
  until nc -z "$DB_HOST" "$DB_PORT"; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done

  echo "PostgreSQL is up - proceeding"
}

# Execute the function
wait_for_db

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node build/server.js
