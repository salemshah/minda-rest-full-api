#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

#.env location
source /root/minda-rest-full-api/.env

# Backup settings
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_DB_NAME}_backup_${DATE}.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Export password for pg_dump
export PGPASSWORD="${BACKUP_DB_PASSWORD}"

# Perform the backup using pg_dump and compress it
pg_dump -U "${BACKUP_DB_USER}" -h "${BACKUP_DB_HOST}" -p "${BACKUP_DB_PORT}" "${BACKUP_DB_NAME}" | gzip > "${BACKUP_FILE}"

# Unset the password variable for security
unset PGPASSWORD

# Delete backups older than 30 days
find "${BACKUP_DIR}" -type f -name "${BACKUP_DB_NAME}_backup_*.sql.gz" -mtime +30 -exec rm {} \;

# Log the backup activity
echo "Logical backup for ${BACKUP_DB_NAME} completed on ${DATE}" >> "${BACKUP_DIR}/backup.log"
