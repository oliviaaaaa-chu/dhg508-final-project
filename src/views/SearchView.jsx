import { useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { search, semanticSearch, motifById } from '../lib/search.js'
import { understand } from '../lib/understand.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import SaveButton from '../components/SaveButton.jsx'
import MotifChip from '../components/MotifChip.jsx'
import UnderstandingPanel from '../components/UnderstandingPanel.jsx'
import { Highlight } from '../components/Highlight.jsx'

// Normalize the two shared-motif shapes (semantic results carry {id, how};
// the keyword fallback still carries plain motif ids).
const sharedId = (m) => (typeof m === 'string' ? m : m.id)
const sharedHow = (m) => (typeof m === 'string' ? 'keyword' : m.how)

export default function SearchView({ onOpen }) {
  const { t, L } = useI18n()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('semantic')
  const [results, setResults] = useState(null)
  const [understanding, setUnderstanding] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const run = async (q = query, m = mode) => {
    if (!q.trim()) return
    setQuery(q)
    setBusy(true)
    setNotice(null)
    // Instant deterministic reading of the request — the panel shows while
    // the model loads; the semantic engine then refines it with
    // meaning-level concepts. Both engines honour this reading.
    const u = understand(q)
    setUnderstanding(u)
    try {
      if (m === 'semantic') {
        const r = await semanticSearch(q, u)
        if (r === null) {
          setNotice(t('search.semanticFallback'))
          setResults(search(q, 'keyword'))
        } else {
          setUnderstanding(r.understanding)
          setResults(r.results)
        }
      } else {
        setResults(search(q, 'keyword'))
      }
    } catch {
      // Any unexpected engine failure degrades to keyword matching.
      setNotice(t('search.semanticFallback'))
      setResults(search(q, 'keyword'))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setNotice(null)
    setUnderstanding(null)
    if (query.trim()) run(query, m)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-display font-semibold">{t('search.title')}</h2>
        <p className="text-sm text-stone-500 mt-1 mb-5">{t('search.subtitle')}</p>

        <div className="flex gap-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <button
            onClick={() => run()}
            disabled={busy}
            className="bg-stone-900 text-amber-50 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
          >
            {busy ? '…' : t('nav.search')}
          </button>
        </div>

        <div className="flex gap-1.5 mb-6">
          {['semantic', 'keyword'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                mode === m ? 'bg-stone-900 text-amber-50 border-stone-900' : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
              }`}
            >
              {t(m === 'keyword' ? 'search.keyword' : 'search.semantic')}
            </button>
          ))}
        </div>

        {busy && <div className="text-sm text-stone-500 bg-white border border-stone-200 rounded-xl p-6 mb-3 animate-pulse">{t('search.loadingSemantic')}</div>}
        {notice && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">{notice}</p>}

        {understanding && <UnderstandingPanel u={understanding} />}

        {results === null && (
          <div className="text-sm text-stone-400 bg-white border border-dashed border-stone-300 rounded-xl p-8 text-center">
            {t('search.subtitle')}
          </div>
        )}

        {results !== null && results.length === 0 && (
          <div className="text-sm text-stone-500 bg-white border border-stone-200 rounded-xl p-8 text-center">{t('search.noResults')}</div>
        )}

        {results !== null && results.length > 0 && mode === 'keyword' && query.trim().split(/\s+/).filter((w) => w.length > 2).length <= 2 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 leading-snug">{t('search.shortQueryTip')}</p>
        )}

        {results && results.length > 0 && (
          <>
            <p className="text-xs text-stone-400 mb-3">
              {results.length} {t('common.results')}
            </p>
            <div className="space-y-3 pb-10">
              {results.map(({ text, pct, strength, shared, matched, best }) => (
                <article key={text.id} className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <button onClick={() => onOpen(text.id)} className="text-left group">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tradColor(text.tradition) }} />
                          <h3 className="font-display font-semibold text-stone-800 group-hover:underline">{L(text.title)}</h3>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {L(TRADITIONS[text.tradition] || { en: text.tradition })} · {L(text.region)} · {text.period}
                        </p>
                      </button>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <div className="text-xs text-stone-400 mb-1">{t('common.score')}</div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${strength === 'strong' ? 'bg-emerald-500' : strength === 'related' ? 'bg-amber-500' : 'bg-stone-300'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${strength === 'strong' ? 'text-emerald-700' : strength === 'related' ? 'text-amber-700' : 'text-stone-400'}`}>
                        {t(`search.strength.${strength}`)}
                      </div>
                    </div>
                  </div>

                  {best[0] && (
                    <p className="text-sm text-stone-600 font-serif leading-relaxed mt-3 line-clamp-3">
                      “<Highlight text={best[0].raw} terms={matched} />”
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {shared.map((m) => (
                      <MotifChip key={sharedId(m)} motif={motifById.get(sharedId(m))} />
                    ))}
                    {shared.length > 0 && (
                      <span className="text-[10px] text-stone-400">
                        ({[...new Set(shared.map(sharedHow))].map((h) => t(`u.how.${h}`)).join(' · ')})
                      </span>
                    )}
                    {matched.length > 0 && (
                      <span className="text-xs text-stone-400">
                        {t('common.matchedTerms')}: <span className="text-stone-600">{matched.join(', ')}</span>
                      </span>
                    )}
                    <span className="ml-auto"><SaveButton item={{
                      type: 'text',
                      ref: text.id,
                      title: L(text.title),
                      subtitle: L(text.region),
                      text: L(text.summary),
                      meta: { textId: text.id, motifs: text.motifs },
                    }} /></span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
