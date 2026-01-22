#!/bin/bash

# Configuration
BACKUP_DIR="$HOME/backups/wechat2doc"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mongodb_backup_$TIMESTAMP"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in .env file"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup to $BACKUP_DIR/$BACKUP_NAME.tar.gz..."

# Perform mongodump
# We extract the URI from DATABASE_URL. 
# Prisma URL usually starts with mongodb+srv:// or mongodb://
mongodump --uri="$DATABASE_URL" --out="$BACKUP_DIR/$BACKUP_NAME"

if [ $? -eq 0 ]; then
    # Compress the backup
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    
    # Remove the uncompressed directory
    rm -rf "$BACKUP_NAME"
    
    echo "Backup completed successfully: $BACKUP_NAME.tar.gz"
    
    # Delete backups older than retention days
    find "$BACKUP_DIR" -type f -name "mongodb_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups cleaned up (Retained last $RETENTION_DAYS days)."
else
    echo "Error: mongodump failed."
    exit 1
fi
