#!/usr/bin/env node
/**
 * Sobe o Metro para Expo Go.
 * Padrão: --tunnel (funciona mesmo com firewall / isolamento do Wi‑Fi).
 * LAN local: pnpm mobile:dev:lan
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

const useLan = process.argv.includes('--lan')
const extraArgs = process.argv.slice(2).filter((arg) => arg !== '--lan')

const hostArgs = useLan ? ['--lan'] : ['--tunnel']

console.log(`\n📱 EntreLinhas mobile — Expo SDK 57 — conta: ${username}`)
if (useLan) {
  console.log('   Modo: LAN (iPhone e PC na mesma rede Wi‑Fi)\n')
} else {
  console.log('   Modo: TUNNEL (recomendado — evita timeout no iPhone)\n')
  console.log('   Escaneie o QR code ou abra o link exp:// no Expo Go.\n')
  console.log('   LAN local: pnpm mobile:dev:lan\n')
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
