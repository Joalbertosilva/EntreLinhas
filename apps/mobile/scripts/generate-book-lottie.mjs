#!/usr/bin/env node
/**
 * Gera Lottie de livro com folhas virando — cores EntreLinhas, fundo transparente.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dir, '../assets/lottie')
mkdirSync(outDir, { recursive: true })

const NAVY = [0.102, 0.2, 0.259, 1]
const TEAL = [0.11, 0.459, 0.416, 1]
const PAGE = [0.99, 0.985, 0.972, 1]
const LINE = [0.55, 0.58, 0.62, 0.28]

const FR = 30
const DURATION = 120
function solid(color) {
  return { ty: 'fl', c: { a: 0, k: color }, o: { a: 0, k: 100 }, r: 1, nm: 'Fill' }
}

function transform(offsetX = 0, offsetY = 0) {
  return {
    ty: 'tr',
    p: { a: 0, k: [offsetX, offsetY] },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
    nm: 'Transform',
  }
}

function roundedRect(w, h, radius, color, offsetX = 0, offsetY = 0) {
  return {
    ty: 'gr',
    it: [
      { ty: 'rc', d: 1, s: { a: 0, k: [w, h] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: radius } },
      solid(color),
      transform(offsetX, offsetY),
    ],
    nm: 'Rect',
  }
}

function line(w, x, y) {
  return {
    ty: 'gr',
    it: [
      { ty: 'rc', d: 1, s: { a: 0, k: [w, 2] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 1 } },
      solid(LINE),
      transform(x, y),
    ],
    nm: 'Line',
  }
}

/** Escala X + leve rotação simulam folha passando (pivô na lombada). */
const animation = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: DURATION,
  w: 512,
  h: 512,
  nm: 'EntreLinhas Book',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Shadow',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [256, 334, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [roundedRect(196, 22, 11, [0.102, 0.2, 0.259, 0.14])],
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Right Base',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [268, 256, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [roundedRect(98, 118, 3, [0.94, 0.93, 0.905, 1])],
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Cover Left',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [188, 256, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        roundedRect(108, 148, 12, NAVY),
        roundedRect(6, 148, 2, TEAL, -48, 0),
      ],
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Left Page',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [208, 256, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        roundedRect(92, 118, 3, PAGE),
        line(62, 12, 20),
        line(62, 12, 38),
        line(62, 12, 56),
        line(62, 12, 74),
      ],
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: 'Right Page Static',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [268, 256, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        roundedRect(88, 112, 3, PAGE),
        line(56, 10, 18),
        line(56, 10, 36),
        line(56, 10, 54),
        line(56, 10, 72),
      ],
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 8,
      ty: 4,
      nm: 'Spine',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [226, 256, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [roundedRect(4, 124, 1, [1, 1, 1, 0.18])],
      ip: 0,
      op: DURATION,
      st: 0,
      bm: 0,
    },
  ],
}

writeFileSync(join(outDir, 'book-pages-turning.json'), JSON.stringify(animation))
console.log('Written', join(outDir, 'book-pages-turning.json'))
