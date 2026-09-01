#!/usr/bin/env bash
# Bootstrap: cria administrador inicial para desenvolvimento local
# Uso: ./scripts/seed-admin.sh
# Credenciais dev: admin / Admin@123456

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! pnpm exec supabase status >/dev/null 2>&1; then
  echo "Erro: Supabase local não está rodando. Execute: pnpm db:start"
  exit 1
fi

eval "$(pnpm exec supabase status -o env 2>/dev/null | grep -E '^(API_URL|SERVICE_ROLE_KEY)=')"

ADMIN_USER="admin"
ADMIN_EMAIL="${ADMIN_USER}@tcc-sistema.internal"
ADMIN_PASS="Admin@123456"
ADMIN_NAME="Administrador Principal"

echo "Criando admin inicial (${ADMIN_USER})..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\",\"email_confirm\":true,\"user_metadata\":{\"nome_usuario\":\"${ADMIN_USER}\",\"nome\":\"${ADMIN_NAME}\"}}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

lookup_user_id() {
  curl -s "${API_URL}/auth/v1/admin/users?email=${ADMIN_EMAIL}" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    | python3 -c "import sys, json; data=json.load(sys.stdin); print(next((u['id'] for u in data.get('users', []) if u.get('email','').lower()=='${ADMIN_EMAIL}'.lower()), ''))"
}

if [ "$HTTP_CODE" = "422" ] || echo "$BODY" | grep -q "already been registered"; then
  echo "Usuário admin já existe — obtendo ID..."
  USER_ID=$(lookup_user_id)
else
  USER_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id',''))" 2>/dev/null || true)
  if [ -z "$USER_ID" ]; then
    USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  fi
fi

if [ -z "$USER_ID" ]; then
  echo "Erro ao criar/obter usuário admin"
  echo "$BODY"
  exit 1
fi

PROFILE_SQL="INSERT INTO public.profiles (id, nome, nome_usuario, perfil, status)
VALUES ('${USER_ID}', '${ADMIN_NAME}', '${ADMIN_USER}', 'administrador', true)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  nome_usuario = EXCLUDED.nome_usuario,
  perfil = EXCLUDED.perfil,
  status = true;"

if command -v psql >/dev/null 2>&1; then
  PGPASSWORD=postgres psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "$PROFILE_SQL"
else
  pnpm exec supabase db query --local "$PROFILE_SQL"
fi

echo ""
echo "✅ Admin criado com sucesso!"
echo "   Nome de usuário: ${ADMIN_USER}"
echo "   Senha:           ${ADMIN_PASS}"
echo "   Studio:          http://127.0.0.1:54323"
