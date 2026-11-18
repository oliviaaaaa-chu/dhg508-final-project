// Writes the next chunk of untranslated passages to a temp file for manual
// (agent) translation, and merges agent-produced translations back into the
// cache. Usage:
//   node scripts/manual_translate.mjs extract [count]   -> tmp/zh-queue.json
//   node scripts/manual_translate.mjs merge tmp/zh-out.json  -> cache += done
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const CACHE = `${root}/data/generated/passages-zh.json`
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}

const [cmd, arg] = process.argv.slice(2)

if (cmd === 'extract') {
  const count = Number(arg) || 40
  const texts = JSON.parse(readFileSync(`${root}/src/data/texts.json`, 'utf8'))
  const queue = []
  outer: for (const t of texts) {
    for (const p of t.passages || []) {
      const id = `${t.id}:${p.id}`
      if (p.text && !cache[id]) {
        queue.push({ id, text: p.text })
        if (queue.length >= count) break outer
      }
    }
  }
  mkdirSync(`${root}/tmp`, { recursive: true })
  writeFileSync(`${root}/tmp/zh-queue.json`, JSON.stringify(queue, null, 1))
  const left = JSON.stringify(cache) && (() => {
    let n = 0
    for (const t of texts) for (const p of t.passages || []) if (p.text && !cache[`${t.id}:${p.id}`]) n++
    return n
  })()
  console.log(`queued ${queue.length}, remaining after this: ${left - queue.length + queue.length - queue.length + (left)}`)
  console.log(`total untranslated left: ${left}`)
} else if (cmd === 'merge') {
  const out = JSON.parse(readFileSync(`${root}/${arg}`, 'utf8'))
  let added = 0
  for (const [id, text] of Object.entries(out)) {
    if (typeof text === 'string' && text.trim()) {
      cache[id] = text.trim()
      added++
    }
  }
  writeFileSync(CACHE, JSON.stringify(cache))
  let total = 0
  const texts = JSON.parse(readFileSync(`${root}/src/data/texts.json`, 'utf8'))
  for (const t of texts) for (const p of t.passages || []) if (p.text && cache[`${t.id}:${p.id}`]) total++
  console.log(`merged ${added}; total translated: ${total}/13875`)
} else {
  console.error('usage: extract [count] | merge <file>')
  process.exit(1)
}
