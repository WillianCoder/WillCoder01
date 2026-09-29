#!/usr/bin/env bash
# Restaura um backup em um banco VAZIO (nunca sobre produção sem backup recente).
# Uso: DATABASE_URL=... npm run db:restore -- backups/bizu-AAAAMMDDTHHMMSSZ.dump
set -euo pipefail
: "${DATABASE_URL:?defina DATABASE_URL do banco de destino}"
file="${1:?informe o arquivo .dump}"
sha256sum --check "$file.sha256"
pg_restore --no-owner --no-privileges --exit-on-error --dbname="$DATABASE_URL" "$file"
echo "Restauração concluída em: ${DATABASE_URL%%@*}@***"
