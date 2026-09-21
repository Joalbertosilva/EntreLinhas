#!/usr/bin/env node
/**
 * Sobe o Metro com Expo SDK local (57) em modo LAN autenticado.
 * Requer a mesma conta no Expo CLI e no Expo Go (ex.: 137588).
 */
import { spawnSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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

console.log(`\n📱 EntreLinhas mobile — Expo SDK 57 (LAN) — conta: ${username}\n`)
console.log('   Confirme que o Expo Go no iPhone está logado na mesma conta.\n')

const args = ['start', '--lan', '--clear', ...process.argv.slice(2)]

const child = spawn(process.execPath, [expoCli, ...args], {
  cwd: mobileRoot,
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => process.exit(code ?? 1))
