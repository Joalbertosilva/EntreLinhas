#!/usr/bin/env bash
# Libera portas do Metro/Expo no firewall Linux (comum em Ubuntu).
set -euo pipefail
PORTS=(8081 19000 19001 19002)
if command -v ufw >/dev/null 2>&1; then
  for p in "${PORTS[@]}"; do
    sudo ufw allow "${p}/tcp" || true
  done
  sudo ufw allow 19000:19002/tcp 2>/dev/null || true
  echo "UFW: portas Expo liberadas."
fi
if command -v firewall-cmd >/dev/null 2>&1; then
  for p in "${PORTS[@]}"; do
    sudo firewall-cmd --add-port="${p}/tcp" --permanent 2>/dev/null || true
  done
  sudo firewall-cmd --reload 2>/dev/null || true
  echo "firewalld: portas liberadas."
fi
if command -v iptables >/dev/null 2>&1; then
  for p in "${PORTS[@]}"; do
    sudo iptables -C INPUT -p tcp --dport "$p" -j ACCEPT 2>/dev/null ||
      sudo iptables -I INPUT -p tcp --dport "$p" -j ACCEPT
  done
  echo "iptables: regras temporárias INPUT para ${PORTS[*]}."
fi
echo "Pronto. Reinicie: pnpm mobile:dev:fresh"