#!/usr/bin/env bash
# Backup do banco (pg_dump formato custom, compactado) com retenção. Uso: npm run db:backup
# Variáveis: DATABASE_URL (obrigatória), BACKUP_DIR (padrão ./backups), BACKUP_RETENTION_DAYS (padrão 30)
set -euo pipefail
: "${DATABASE_URL:?defina DATABASE_URL}"
dir="${BACKUP_DIR:-./backups}"
keep="${BACKUP_RETENTION_DAYS:-30}"
mkdir -p "$dir"
file="$dir/bizu-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --no-privileges --dbname="$DATABASE_URL" --file="$file.tmp"
mv "$file.tmp" "$file"
sha256sum "$file" > "$file.sha256"
pg_restore --list "$file" > /dev/null   # confere se o arquivo é legível
find "$dir" -name 'bizu-*.dump*' -mtime +"$keep" -delete
echo "Backup OK: $file"
