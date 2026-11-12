#!/usr/bin/env node
/**
 * Sobe o Metro para Expo Go.
 * Padrão (CLI logado): LAN com manifesto assinado pela sua conta Expo.
 * --offline: manifesto anônimo — só use com Expo Go *sem* login no celular.
 * Tunnel: pnpm mobile:dev:tunnel (outra rede / firewall).
 */
import { spawnSync, spawn, execSync } from 'node:child_process'
import { cpSync, existsSync, lstatSync, mkdirSync, symlinkSync } from 'node:fs'
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

const useTunnel = process.argv.includes('--tunnel')
const forceOffline = process.argv.includes('--offline')
const rawArgs = process.argv.slice(2).filter(
  (arg) => arg !== '--tunnel' && arg !== '--lan' && arg !== '--offline',
)
const wantsClear = rawArgs.includes('--clear') || rawArgs.includes('-c')
const extraArgs = rawArgs.filter((arg) => arg !== '--clear' && arg !== '-c')

const whoami = runExpo(['whoami'])
const username = whoami.stdout?.trim()
const loggedIn = whoami.status === 0 && username && username !== 'Not logged in'

if (useTunnel && !loggedIn) {
  console.error('\n❌ Tunnel exige Expo CLI logado.\n')
  console.error('   Rode: pnpm mobile:login\n')
  process.exit(1)
}

/** Metro serve `/images/*` como pasta na raiz do app — espelha `assets/images`. */
function ensureMetroImagesDir() {
  const imagesDir = resolve(mobileRoot, 'images')
  const assetsImages = resolve(mobileRoot, 'assets/images')
  if (!existsSync(assetsImages)) return

  if (existsSync(imagesDir)) {
    try {
      const st = lstatSync(imagesDir)
      if (st.isSymbolicLink() || st.isDirectory()) return
    } catch {
      // recria abaixo
    }
  }

  try {
    symlinkSync(assetsImages, imagesDir, 'dir')
    console.log('   Pasta images/ → assets/images (Metro)\n')
  } catch {
    mkdirSync(imagesDir, { recursive: true })
    cpSync(assetsImages, imagesDir, { recursive: true })
    console.log('   Pasta images/ copiada de assets/images (Metro)\n')
  }
}

let hostArgs
if (useTunnel) {
  hostArgs = ['--tunnel']
} else if (forceOffline) {
  hostArgs = ['--offline']
} else if (loggedIn) {
  hostArgs = ['--lan']
} else {
  hostArgs = ['--offline']
}

console.log(`\n📱 EntreLinhas mobile — Expo SDK 58${loggedIn ? ` — conta: ${username}` : ''}`)
if (useTunnel) {
  console.log('   Modo: TUNNEL (ngrok — use se iPhone estiver em outra rede)\n')
  console.log('   Se o tunnel cair, reinicie ou use LAN: pnpm mobile:dev\n')
} else if (hostArgs.includes('--offline')) {
  console.log('   Modo: LAN + offline (manifesto anônimo)\n')
  console.log('   ⚠️  No iPhone use Expo Go *sem* conta (ou outra sessão anônima).')
  console.log('   Com conta no celular, rode sem --offline: pnpm mobile:dev\n')
} else {
  console.log('   Modo: LAN (manifesto assinado pela conta do CLI — combine com Expo Go logado)\n')
  console.log('   Outra rede? pnpm mobile:dev:tunnel\n')
}
console.log('   RAM baixa? Feche apps pesados antes de abrir no iPhone.\n')

ensureMetroImagesDir()

freePort8081()

const args = ['start', ...hostArgs, ...(wantsClear ? ['--clear'] : []), ...extraArgs]

const child = spawn(process.execPath, [expoCli, ...args], {
  cwd: mobileRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_NO_TELEMETRY: '1',
    // Menos workers = menos pico de RAM ao empacotar para iOS (evita 500/OOM no Metro).
    METRO_MAX_WORKERS: process.env.METRO_MAX_WORKERS ?? '2',
  },
})

child.on('exit', (code) => process.exit(code ?? 1))
