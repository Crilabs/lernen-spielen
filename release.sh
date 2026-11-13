#!/usr/bin/env bash
# Neue Version veröffentlichen: ./release.sh 0.2.0 ["Release-Notiz"]
# Prüft, hebt die Version an, committet, taggt und pusht erst ganz am Ende.
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${1:-}"
NOTIZ="${2:-}"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Aufruf: ./release.sh X.Y.Z [\"Release-Notiz\"]" >&2
  exit 1
fi
TAG="v$VERSION"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Abbruch: Arbeitsstand ist nicht sauber (git status)." >&2
  exit 1
fi
if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Abbruch: Tag $TAG gibt es schon." >&2
  exit 1
fi

npm test
(cd src-tauri && cargo test)

# Version setzen: package.json (+Lock), tauri.conf.json, Cargo.toml (nur [package]).
npm version "$VERSION" --no-git-tag-version >/dev/null
node -e '
  const fs = require("fs");
  const p = "src-tauri/tauri.conf.json";
  const c = JSON.parse(fs.readFileSync(p, "utf8"));
  c.version = process.argv[1];
  fs.writeFileSync(p, JSON.stringify(c, null, 2) + "\n");
' "$VERSION"
perl -0pi -e 's/^version = "[^"]*"/version = "'"$VERSION"'"/m' src-tauri/Cargo.toml
(cd src-tauri && cargo check --quiet)   # schreibt die neue Version in Cargo.lock

git add package.json package-lock.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock
git commit -m "release: $TAG"
if [[ -n "$NOTIZ" ]]; then
  git tag -a "$TAG" -m "$NOTIZ"
else
  git tag -a "$TAG"   # öffnet den Editor für die Release-Notiz
fi

git push origin HEAD "$TAG"
echo "Fertig: $TAG ist veröffentlicht, GitHub Actions baut jetzt das Release."
