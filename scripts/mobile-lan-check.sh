#!/usr/bin/env bash
# Testa se o Metro está acessível na interface Wi‑Fi (como o iPhone veria).
set -euo pipefail
IP="$(ip -4 -o addr show wlp4s0 2>/dev/null | awk '{print $4}' | cut -d/ -f1)"
IP="${IP:-$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}')}"
PORT=8081

echo "IP Wi‑Fi: ${IP:-?}"
if ! lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "❌ Metro não está rodando na porta $PORT. Rode: pnpm mobile:dev"
  exit 1
fi

CODE=$(curl -sS -m 3 -o /dev/null -w "%{http_code}" "http://${IP}:${PORT}/status" || echo "000")
echo "Teste local http://${IP}:${PORT}/status → HTTP $CODE"

if [[ "$CODE" != "200" ]]; then
  echo "❌ Metro não respondeu no IP da Wi‑Fi."
  exit 1
fi

echo ""
echo "Se o iPhone (Safari) NÃO abrir o mesmo URL, o bloqueio é rede/firewall/roteador."
echo ""
echo "No PC, rode (precisa de senha sudo):"
echo "  sudo ufw allow 8081/tcp"
echo "  sudo ufw allow 19000:19002/tcp"
echo "  sudo ufw reload"
echo ""
echo "Ou use tunnel (ignora LAN):"
echo "  pnpm mobile:dev:tunnel"