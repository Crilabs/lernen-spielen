#!/usr/bin/env bash
# Lädt die Spiele per FTP auf den Webserver.
#   ./deploy.sh          hochladen (nur geänderte Dateien)
#   ./deploy.sh --test   nur anzeigen, was hochgeladen würde
# Auf dem Server wird nichts gelöscht; die Spielstände (*.json im Hauptordner) bleiben unberührt.
set -euo pipefail
cd "$(dirname "$0")"

[[ -f .env ]] || { echo "Fehlt: .env"; exit 1; }
set -a; source .env; set +a

for v in FTP_HOST FTP_USER FTP_PASS FTP_DIR; do
  [[ -n "${!v:-}" ]] || { echo "In .env fehlt: $v"; exit 1; }
done
command -v lftp >/dev/null || { echo "lftp fehlt: brew install lftp"; exit 1; }

DRY=""
[[ "${1:-}" == "--test" ]] && DRY="--dry-run" && echo "Testlauf – es wird nichts hochgeladen."

export LFTP_PASSWORD="$FTP_PASS"

lftp <<EOF
set cmd:fail-exit yes
set net:max-retries 2
set net:timeout 20
set ftp:ssl-allow yes
set ftp:ssl-force $([[ "${FTP_SSL_FORCE:-0}" == 1 ]] && echo yes || echo no)
set ssl:verify-certificate $([[ "${FTP_SSL_VERIFY:-1}" == 0 ]] && echo no || echo yes)
open --env-password -u "$FTP_USER" ${FTP_PROTOCOL:-ftp}://$FTP_HOST
mirror --reverse --only-newer --no-perms --verbose $DRY \
  --exclude-glob '.*' \
  --exclude-glob '.*/' \
  --exclude-glob 'docs/' \
  --exclude-glob 'deploy.sh' \
  --exclude-glob 'README.md' \
  --exclude-glob 'ideen.txt' \
  --exclude-glob 'spielstand.json' \
  --exclude-glob 'bruecke.json' \
  --exclude-glob 'wimmel.json' \
  --exclude-glob 'zauber.json' \
  --exclude-glob 'steine.json' \
  --exclude-glob 'zahlen.json' \
  . "$FTP_DIR"
bye
EOF

echo "Fertig."
