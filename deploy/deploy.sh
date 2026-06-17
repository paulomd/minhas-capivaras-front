#!/usr/bin/env bash
# VPS: pull da imagem publicada no GHCR e sobe apenas o frontend.
# Uso: ./deploy.sh http://203.0.113.10
set -euo pipefail

cd "$(dirname "$0")"

PUBLIC_URL="${1:-${APP_PUBLIC_URL:-}}"
if [[ -z "$PUBLIC_URL" ]]; then
  echo "Uso: $0 <URL pública sem barra final>"
  echo "  ou export APP_PUBLIC_URL=http://203.0.113.10"
  exit 1
fi
PUBLIC_URL="${PUBLIC_URL%/}"

if [[ ! -f .env ]]; then
  echo "Copie .env.example para .env e defina GHCR_IMAGE e API_URL."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ -z "${GHCR_IMAGE:-}" ]]; then
  echo "Defina GHCR_IMAGE no .env (ex. ghcr.io/paulomd/minhas-capivaras-front)."
  exit 1
fi

export APP_PUBLIC_URL="${PUBLIC_URL}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

if [[ -z "${API_URL:-}" ]]; then
  BACKEND_PORT="${BACKEND_PORT:-8090}"
  export API_URL="http://host.docker.internal:${BACKEND_PORT}"
fi

COMPOSE=(docker compose)

if ! docker pull "${GHCR_IMAGE}:${IMAGE_TAG}" 2>/dev/null; then
  echo ""
  echo ">>> Não foi possível baixar a imagem do GHCR."
  echo "    Repositório privado? Faça login:"
  echo "      echo SEU_PAT | docker login ghcr.io -u SEU_USUARIO --password-stdin"
  exit 1
fi

touch .env
grep -q '^APP_PUBLIC_URL=' .env && sed -i "s|^APP_PUBLIC_URL=.*|APP_PUBLIC_URL=${PUBLIC_URL}|" .env || echo "APP_PUBLIC_URL=${PUBLIC_URL}" >> .env
grep -q '^API_URL=' .env && sed -i "s|^API_URL=.*|API_URL=${API_URL}|" .env || echo "API_URL=${API_URL}" >> .env

echo ">>> Atualizando imagem..."
"${COMPOSE[@]}" pull

echo ">>> Subindo frontend..."
"${COMPOSE[@]}" up -d

echo ""
echo ">>> Deploy do frontend concluído."
echo "    App:     ${PUBLIC_URL}:${FRONTEND_PORT:-3000}"
echo "    API_URL: ${API_URL} (proxy server-side /api/backend)"
echo "    Imagem:  ${GHCR_IMAGE}:${IMAGE_TAG}"
