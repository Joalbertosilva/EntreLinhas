export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  if (typeof globalThis.btoa === 'function') return globalThis.btoa(binary)
  // React Native / Node
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const buf = require('buffer') as typeof import('buffer')
  return buf.Buffer.from(bytes).toString('base64')
}