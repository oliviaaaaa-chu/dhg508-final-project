import { readFileSync, writeFileSync } from 'node:fs'

function appendKeys(p, entries) {
  const src = readFileSync(p, 'utf8')
  const idx = src.lastIndexOf('}')
  const lines =
    Object.entries(entries)
      .map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v) + ',')
      .join('\n') + '\n'
  writeFileSync(p, src.slice(0, idx) + lines + src.slice(idx))
}

appendKeys('src/i18n/en.js', {
  'common.translationNote': 'AI translation of the public-domain original — the English text below is the source.',
  'common.showOriginal': 'English original',
  'common.showTranslation': 'Chinese translation',
})
appendKeys('src/i18n/zh-TW.js', {
  'common.translationNote': 'AI 譯文——原文為公有領域英文文本，可切換查看。',
  'common.showOriginal': '查看英文原文',
  'common.showTranslation': '查看中文譯文',
})
console.log('i18n keys added')
