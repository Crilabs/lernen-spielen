#!/usr/bin/env bash
# Rollt den Tagesbrief-Dienst auf crilabs-app-server aus (dienste/tagesbrief/README.md). Aufruf aus dem Repo-Wurzelordner:
#   dienste/tagesbrief/betrieb/ausrollen.sh            Code + Unit (Einrichtung beim ersten Mal), Neustart des Dienstes
#   dienste/tagesbrief/betrieb/ausrollen.sh --caddy    zusätzlich Caddy-Block kopieren, validieren, reload
# Ändert auf dem Server nur: Nutzer tagesbrief, Rechte in /etc/lernen-spielen, /opt/lernen-spielen-tagesbrief,
# die eigene Unit und (mit --caddy) /etc/caddy/lernen-spielen.caddy plus eine import-Zeile im Caddyfile.
set -euo pipefail

SERVER="${SERVER:-crilabs-app-server}"
ZIEL=/opt/lernen-spielen-tagesbrief
cd "$(git rev-parse --show-toplevel)"

# Nur was der Dienst braucht, im selben relativen Aufbau wie im Repo (versand.js importiert ../../spiele/tagesbrief/brief.js).
stufe="$(mktemp -d)"
trap 'rm -rf "$stufe"' EXIT
mkdir -p "$stufe/dienste/tagesbrief" "$stufe/spiele/tagesbrief" "$stufe/spiele/mit-echten-dingen/mathe/bilder"
cp dienste/tagesbrief/*.js "$stufe/dienste/tagesbrief/"
cp spiele/tagesbrief/brief.js "$stufe/spiele/tagesbrief/"
cp spiele/mit-echten-dingen/mathe/bilder/neunerreihe.brief.jpg "$stufe/spiele/mit-echten-dingen/mathe/bilder/"
cp dienste/tagesbrief/betrieb/package.json "$stufe/"
# Rechte schon hier setzen; rsync -p übernimmt sie (macOS-openrsync kennt weder --chown noch --chmod=D…,F…).
find "$stufe" -type d -exec chmod 755 {} +
find "$stufe" -type f -exec chmod 644 {} +

echo "== Einrichtung (idempotent)"
ssh "$SERVER" 'bash -s' <<'EOF'
set -euo pipefail
id tagesbrief >/dev/null 2>&1 || useradd --system --user-group --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin tagesbrief
chgrp tagesbrief /etc/lernen-spielen /etc/lernen-spielen/graph.key /etc/lernen-spielen/graph.env
chmod 750 /etc/lernen-spielen
chmod 640 /etc/lernen-spielen/graph.key /etc/lernen-spielen/graph.env
install -d -o root -g root -m 755 /opt/lernen-spielen-tagesbrief
EOF

echo "== Code nach $ZIEL"
# Ohne -o/-g legt rsync als root alles mit Besitzer root an.
rsync -rlpt --delete "$stufe/" "$SERVER:$ZIEL/"

echo "== Unit"
scp -q dienste/tagesbrief/betrieb/lernen-spielen-tagesbrief.service "$SERVER:/etc/systemd/system/lernen-spielen-tagesbrief.service"
ssh "$SERVER" 'bash -s' <<'EOF'
set -euo pipefail
chmod 644 /etc/systemd/system/lernen-spielen-tagesbrief.service
systemctl daemon-reload
systemctl enable lernen-spielen-tagesbrief >/dev/null
systemctl restart lernen-spielen-tagesbrief
sleep 2
systemctl is-active lernen-spielen-tagesbrief
curl -s -o /dev/null -w 'lokal /datenschutz: %{http_code}\n' http://127.0.0.1:3600/datenschutz
EOF

[[ "${1:-}" == "--caddy" ]] || exit 0

echo "== Caddy"
scp -q dienste/tagesbrief/betrieb/lernen-spielen.caddy "$SERVER:/etc/caddy/lernen-spielen.caddy.neu"
ssh "$SERVER" 'bash -s' <<'EOF'
set -euo pipefail
cd /etc/caddy
[[ -f lernen-spielen.caddy ]] && cp -p lernen-spielen.caddy lernen-spielen.caddy.vorher
mv lernen-spielen.caddy.neu lernen-spielen.caddy
chmod 644 lernen-spielen.caddy
neu_importiert=0
if ! grep -qx 'import /etc/caddy/lernen-spielen.caddy' Caddyfile; then
  cp -p Caddyfile "Caddyfile.bak-$(date +%F)"
  printf '\n# Lernen-Spielen Tagesbrief (einhorn-lernspiele: dienste/tagesbrief/betrieb/)\nimport /etc/caddy/lernen-spielen.caddy\n' >> Caddyfile
  neu_importiert=1
fi
if ! caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then
  echo "caddy validate fehlgeschlagen – stelle den vorigen Stand her" >&2
  [[ $neu_importiert == 1 ]] && cp -p "Caddyfile.bak-$(date +%F)" Caddyfile
  if [[ -f lernen-spielen.caddy.vorher ]]; then mv lernen-spielen.caddy.vorher lernen-spielen.caddy; else rm -f lernen-spielen.caddy; fi
  exit 1
fi
rm -f lernen-spielen.caddy.vorher
systemctl reload caddy
echo "caddy reload ok"
EOF
