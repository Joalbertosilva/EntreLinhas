#!/usr/bin/env node
/** Falha se o Metro devolver bundle iOS com erro (ex.: SyntaxError no código). */
import http from 'node:http'

const PORT = 8081
const PATH =
  '/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable'

http
  .get(`http://127.0.0.1:${PORT}${PATH}`, (res) => {
    let body = ''
    res.on('data', (c) => {
      body += c
      if (body.length > 800_000) res.destroy()
    })
    res.on('close', () => finish(res.statusCode ?? 0, body))
    res.on('end', () => finish(res.statusCode ?? 0, body))
  })
  .on('error', (err) => {
    console.error('\n❌ Metro não está em 127.0.0.1:8081 — rode: pnpm mobile:dev\n')
    console.error(String(err.message))
    process.exit(1)
  })

function finish(status, body) {
  if (status !== 200) {
    console.error(`\n❌ Bundle iOS respondeu HTTP ${status}. O Expo Go NÃO vai abrir.\n`)
    if (body.includes('TransformError') || body.includes('SyntaxError')) {
      const msg = body.slice(0, 1200)
      console.error(msg)
    }
    process.exit(1)
  }
  const trimmed = body.trimStart()
  if (trimmed.startsWith('{') && trimmed.includes('"type":"TransformError"')) {
    console.error('\n❌ Metro retornou erro de transformação no bundle.\n')
    console.error(body.slice(0, 1200))
    process.exit(1)
  }
  console.log(`\n✅ Bundle iOS OK (HTTP 200, ${body.length} bytes)\n`)
  process.exit(0)
}