#!/usr/bin/env node
/**
 * Diagnóstico rápido: Metro, manifest, bundle e rede LAN (sem abrir o app).
 */
import http from 'node:http'
import os from 'node:os'
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = 8081

function pickLanIp() {
  const candidates = []
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const net of ifaces ?? []) {
      if (net.family !== 'IPv4' || net.internal) continue
      if (net.address.startsWith('169.254.')) continue
      candidates.push(net.address)
    }
  }
  return (
    candidates.find((a) => /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(a)) ??
    candidates[0] ??
    '127.0.0.1'
  )
}

function httpGet(url, timeoutMs = 8_000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () =>
        resolve({
          ok: res.statusCode === 200,
          status: res.statusCode ?? 0,
          body: Buffer.concat(chunks).toString('utf8'),
        }),
      )
    })
    req.on('error', (err) => resolve({ ok: false, status: 0, body: String(err.message) }))
    req.setTimeout(timeoutMs, () => {
      req.destroy()
      resolve({ ok: false, status: 0, body: 'timeout' })
    })
  })
}

const lanIp = pickLanIp()
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mobileRoot = resolve(root, 'apps/mobile')

let metroPid = ''
try {
  metroPid = execSync(`lsof -ti:${PORT} 2>/dev/null | head -1`, { encoding: 'utf8' }).trim()
} catch {
  // noop
}

console.log('\n📱 Diagnóstico EntreLinhas mobile\n')
console.log(`   IP LAN (Wi‑Fi): ${lanIp}`)
console.log(`   Metro na porta ${PORT}: ${metroPid ? `rodando (pid ${metroPid})` : '**NÃO RODOU** — execute: pnpm mobile:dev'}\n`)

if (!metroPid) {
  console.log('   Sem Metro não dá para testar o celular. Suba o servidor e rode de novo:\n')
  console.log('   pnpm mobile:dev\n')
  process.exit(1)
}

const loopback = await httpGet(`http://127.0.0.1:${PORT}/status`)
const lanStatus = await httpGet(`http://${lanIp}:${PORT}/status`)

console.log(`   /status (localhost): ${loopback.ok ? 'OK' : 'FALHOU'} — ${loopback.body.trim() || loopback.body}`)
console.log(`   /status (${lanIp}):    ${lanStatus.ok ? 'OK' : 'FALHOU'} — ${lanStatus.body.trim() || lanStatus.body}\n`)

const manifest = await httpGet(`http://${lanIp}:${PORT}/`)
let sdk = '?'
let bundlePath = ''
if (manifest.ok) {
  try {
    const j = JSON.parse(manifest.body)
    sdk = j?.extra?.expoClient?.sdkVersion ?? j?.runtimeVersion ?? '?'
    bundlePath = j?.launchAsset?.url ?? ''
    const hostUri = j?.extra?.expoClient?.hostUri ?? ''
    console.log(`   Manifest: SDK ${sdk}, hostUri ${hostUri}`)
    console.log(`   Bundle: ${bundlePath.slice(0, 100)}…\n`)
  } catch {
    console.log('   Manifest: resposta inválida\n')
  }
} else {
  console.log('   Manifest: FALHOU\n')
}

const bundleUrl =
  bundlePath ||
  `http://${lanIp}:${PORT}/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable`

const t0 = Date.now()
const bundle = await httpGet(bundleUrl, 120_000)
const sec = ((Date.now() - t0) / 1000).toFixed(1)
console.log(
  `   Bundle iOS (PC→PC via ${lanIp}): ${bundle.ok ? 'OK' : 'FALHOU'} em ${sec}s (${bundle.body.length} bytes resposta)\n`,
)

console.log('── Teste decisivo no iPhone (Safari) ──\n')
console.log(`   1. Mesmo Wi‑Fi que o PC (não use 4G).`)
console.log(`   2. Abra o Safari e cole:\n`)
console.log(`      http://${lanIp}:${PORT}/status\n`)
console.log('   Deve aparecer só o texto: packager-status:running')
console.log('   • Se NÃO abrir → roteador bloqueia celular→PC (AP isolation).')
console.log('     Solução: pnpm mobile:dev:tunnel (usa ngrok — mais lento, mas entra).\n')
console.log('   • Se abrir no Safari mas o Expo Go falha → conta Expo / SDK 58 / cache:')
console.log('     - Expo Go: mesma conta que pnpm mobile:whoami (137588)')
console.log('     - Settings → SDK 58')
console.log(`     - Enter URL: exp://${lanIp}:${PORT}`)
console.log('     - Feche o Expo Go por completo e tente de novo.\n')

const envFile = resolve(mobileRoot, '.env')
try {
  const fs = await import('node:fs')
  const env = fs.readFileSync(envFile, 'utf8')
  const hasKey = /^EXPO_PUBLIC_SUPABASE_ANON_KEY=\S+/m.test(env)
  const hasUrl = /^EXPO_PUBLIC_SUPABASE_URL=\S+/m.test(env)
  console.log(`   apps/mobile/.env: URL ${hasUrl ? 'OK' : 'FALTA'}, anon key ${hasKey ? 'OK' : 'FALTA'}\n`)
} catch {
  console.log('   apps/mobile/.env: **ausente** — copie de .env.example\n')
}

process.exit(lanStatus.ok && bundle.ok ? 0 : 1)