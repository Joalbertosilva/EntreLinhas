#!/usr/bin/env node
/**
 * Sobe o Metro para Expo Go.
 * Padrão: LAN (estável na mesma Wi‑Fi — evita quedas do ngrok/tunnel).
 * Tunnel: pnpm mobile:dev:tunnel (outra rede / firewall).
 */
import { spawnSync, spawn, execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

function freePort8081() {
  try {
    const pids = execSync('lsof -ti:8081 2>/dev/null', { encoding: 'utf8' }).trim()
    if (!pids) return
    console.log('   Encerrando Metro anterior na porta 8081…')
    for (const pid of pids.split('\n').filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGTERM')
      } catch {
        // noop
      }
    }
    spawnSync('sleep', ['1'])
    for (const pid of pids.split('\n').filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGKILL')
      } catch {
        // noop
      }
    }
  } catch {
    // porta livre
  }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mobileRoot = resolve(root, 'apps/mobile')
const expoCli = resolve(root, 'node_modules/expo/bin/cli')

if (!existsSync(expoCli)) {
  console.error('\n❌ Expo não encontrado. Rode na raiz: pnpm install\n')
  process.exit(1)
}

function runExpo(args) {
  return spawnSync(process.execPath, [expoCli, ...args], {
    cwd: mobileRoot,
    encoding: 'utf8',
    env: process.env,
  })
}

const whoami = runExpo(['whoami'])
const username = whoami.stdout?.trim()

if (whoami.status !== 0 || !username || username === 'Not logged in') {
  console.error('\n❌ Expo CLI não está logado.\n')
  console.error('   Rode: pnpm mobile:login\n')
  console.error('   Use a MESMA conta do Expo Go no iPhone.\n')
  process.exit(1)
}

const useTunnel = process.argv.includes('--tunnel')
const extraArgs = process.argv.slice(2).filter((arg) => arg !== '--tunnel' && arg !== '--lan')

const hostArgs = useTunnel ? ['--tunnel'] : ['--lan']

console.log(`\n📱 EntreLinhas mobile — Expo SDK 57 — conta: ${username}`)
if (useTunnel) {
  console.log('   Modo: TUNNEL (ngrok — use se iPhone estiver em outra rede)\n')
  console.log('   Se o tunnel cair, reinicie ou use LAN: pnpm mobile:dev\n')
} else {
  console.log('   Modo: LAN (iPhone e PC na mesma Wi‑Fi — recomendado)\n')
  console.log('   Outra rede? pnpm mobile:dev:tunnel\n')
}

freePort8081()

const args = ['start', ...hostArgs, '--clear', ...extraArgs]

const child = spawn(process.execPath, [expoCli, ...args], {
  cwd: mobileRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_NO_TELEMETRY: '1',
  },
})

child.on('exit', (code) => process.exit(code ?? 1))
