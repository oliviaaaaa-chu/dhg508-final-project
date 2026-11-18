// Copies the built corpus JSON into public/ so it is served as a static
// asset and fetched lazily by the app (the corpus is no longer bundled into
// the JavaScript — see src/lib/search.js).
import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('public', { recursive: true })
copyFileSync('src/data/texts.json', 'public/corpus.json')
console.log('emit_corpus: public/corpus.json updated')
