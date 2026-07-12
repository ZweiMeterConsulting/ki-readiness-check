#!/usr/bin/env bash
# Einmaliges Brevo-Setup für den KI-Readiness-Check:
#  - legt die Kontaktliste "KI-Readiness-Leads" an (falls nicht vorhanden)
#  - legt alle KI_*-Kontaktattribute an
#  - gibt die BREVO_LIST_ID aus, die in .env.local / Coolify eingetragen wird
#
# Voraussetzung: die aufrufende IP ist in Brevo unter
#   Security → Authorised IPs
# freigeschaltet (sonst 401 unauthorized). Der API-Key wird aus .env.local gelesen.
#
# Aufruf (aus dem Projekt-Root):  bash scripts/brevo-setup.sh
set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env.local"
KEY=$(grep '^BREVO_API_KEY=' "$ENV_FILE" | cut -d= -f2-)
if [ -z "${KEY:-}" ]; then echo "FEHLER: BREVO_API_KEY fehlt in $ENV_FILE"; exit 1; fi

BASE="https://api.brevo.com/v3"
LIST_NAME="KI-Readiness-Leads"
FOLDER_ID=3   # gleicher Ordner wie OMPA-Leads; bei Bedarf anpassen

hdr=(-H "api-key: $KEY" -H "content-type: application/json")

echo "→ Suche/erzeuge Liste \"$LIST_NAME\" …"
LIST_ID=$(curl -s "${hdr[@]}" "$BASE/contacts/lists?limit=50" \
  | grep -o "{[^{}]*\"name\":\"$LIST_NAME\"[^{}]*}" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2 || true)

if [ -z "${LIST_ID:-}" ]; then
  LIST_ID=$(curl -s "${hdr[@]}" -X POST "$BASE/contacts/lists" \
    -d "{\"name\":\"$LIST_NAME\",\"folderId\":$FOLDER_ID}" \
    | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  echo "   Liste angelegt: ID=$LIST_ID"
else
  echo "   Liste existiert bereits: ID=$LIST_ID"
fi

# Attribut anlegen (idempotent – "already exists" wird ignoriert).
create_attr () {
  local name="$1" type="$2"
  local resp
  resp=$(curl -s "${hdr[@]}" -X POST "$BASE/contacts/attributes/normal/$name" -d "{\"type\":\"$type\"}")
  if echo "$resp" | grep -qi 'already exist'; then
    echo "   • $name ($type) – existiert"
  elif [ -z "$resp" ]; then
    echo "   • $name ($type) – angelegt"
  else
    echo "   • $name ($type) – $resp"
  fi
}

echo "→ Lege KI_*-Attribute an …"
create_attr KI_PERSONA      text
create_attr KI_SCORE        float
create_attr KI_PROZENT      float
create_attr KI_LEVEL        float
create_attr KI_LEVEL_TITEL  text
create_attr KI_STRATEGIE    float
create_attr KI_PROZESSE     float
create_attr KI_DATEN        float
create_attr KI_TECHNIK      float
create_attr KI_MENSCHEN     float
create_attr KI_REGULATORIK  float
create_attr KI_KILLER       text
create_attr KI_QUELLE       text

echo ""
echo "FERTIG. Trage in .env.local (und in Coolify) ein:"
echo "  BREVO_LIST_ID=$LIST_ID"
