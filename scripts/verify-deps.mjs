#!/usr/bin/env node
/**
 * Verifica se dependências críticas do frontend estão instaladas corretamente.
 * Detecta node_modules corrompido/incompleto (ex.: tailwindcss/index.css ausente).
 */
import { createRequire } from 'node:module'
import { accessSync, constants } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const webRoot = resolve(root, 'apps/web')
const require = createRequire(resolve(webRoot, 'package.json'))

const checks = [
  { name: 'tailwindcss', resolve: () => require.resolve('tailwindcss/index.css') },
  { name: '@tailwindcss/vite', resolve: () => require.resolve('@tailwindcss/vite') },
  { name: 'vite', resolve: () => require.resolve('vite') },
  { name: 'react', resolve: () => require.resolve('react') },
]

const missing = []

for (const check of checks) {
  try {
    const file = check.resolve()
    accessSync(file, constants.R_OK)
  } catch {
    missing.push(check.name)
  }
}

if (missing.length > 0) {
  console.error('\n❌ Dependências incompletas ou corrompidas:', missing.join(', '))
  console.error('\nCausa comum: `pnpm install` interrompido ou pasta node_modules parcialmente removida.')
  console.error('\nCorrija com:\n')
  console.error('  pnpm deps:fix')
  console.error('\nDepois confirme:\n')
  console.error('  pnpm deps:verify\n')
  process.exit(1)
}
