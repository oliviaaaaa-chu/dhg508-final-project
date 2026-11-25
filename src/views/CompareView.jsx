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
// the lexical fallback still carries plain motif ids).
const sharedId = (m) => (typeof m === 'string' ? m : m.id)
const sharedHow = (m) => (typeof m === 'string' ? 'keyword' : m.how)

export default function CompareView({ onOpen }) {
  const { t, L } = useI18n()
  const [input, setInput] = useState('')
  const [results, setResults] = useState(null)
  const [understanding, setUnderstanding] = useState(null)
  const [notice, setNotice] = useState(null)

  const examples = [t('compare.example1'), t('compare.example2'), t('compare.example3'), t('compare.example4')]

  const run = async (text = input) => {
    if (!text.trim()) return
    setInput(text)
    setNotice(null)
    // Instant deterministic reading (filler, negation, story beats, wording-
    // level motifs); the model then adds meaning-level concepts. Both
    // engines honour this reading, so the panel stays in the fallback too.
    const u = understand(text)
    setUnderstanding(u)
    try {
      const sem = await semanticSearch(text, u)
      if (sem) {
        setUnderstanding(sem.understanding)
        setResults({ list: sem.results.slice(0, 5) })
        return
      }
    } catch {
      /* engine failure — fall through to lexical matching */
    }
    setNotice(t('search.semanticFallback'))
    setResults({ list: search(text, 'semantic').slice(0, 5) })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-display font-semibold">{t('compare.title')}</h2>
        <p className="text-sm text-stone-500 mt-1 mb-5">{t('compare.subtitle')}</p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={t('compare.placeholder')}
          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-y"
        />

        <div className="flex flex-wrap items-center gap-2 mt-3 mb-6">
          <button
            onClick={() => run()}
            className="bg-stone-900 text-amber-50 rounded-lg px-5 py-2 text-sm font-medium hover:bg-stone-700"
          >
            {t('compare.run')}
          </button>
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => run(ex)}
              className="text-xs text-stone-500 bg-white border border-stone-200 rounded-full px-3 py-1.5 hover:border-amber-400 hover:text-amber-800 transition-colors"
            >
              {ex.length > 44 ? ex.slice(0, 44) + '…' : ex}
            </button>
          ))}
        </div>

        {notice && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">{notice}</p>}

        {understanding && <UnderstandingPanel u={understanding} />}

        {results !== null && results.list.length === 0 && (
          <div className="text-sm text-stone-500 bg-white border border-stone-200 rounded-xl p-8 text-center">{t('compare.noResults')}</div>
        )}

        {results && results.list.length > 0 && (
          <>
            <div className="space-y-4 pb-10">
              {results.list.map(({ text, pct, strength, shared, matched, best }, rank) => (
              <article key={text.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 pt-4">
                  <span className="w-7 h-7 rounded-full bg-stone-900 text-amber-50 text-xs font-bold inline-flex items-center justify-center shrink-0">
                    {rank + 1}
                  </span>
                  <button onClick={() => onOpen(text.id)} className="flex-1 text-left group">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tradColor(text.tradition) }} />
                      <h3 className="font-display font-semibold text-stone-800 group-hover:underline">{L(text.title)}</h3>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {L(TRADITIONS[text.tradition] || { en: text.tradition })} · {L(text.region)} · {text.period}
                    </p>
                  </button>
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

                <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                  {shared.length > 0 && (
                    <>
                      <span className="text-xs text-stone-400 self-center">{t('common.sharedMotifs')}:</span>
                      {shared.map((m) => (
                        <MotifChip key={sharedId(m)} motif={motifById.get(sharedId(m))} />
                      ))}
                      <span className="text-[10px] text-stone-400 self-center">
                        ({[...new Set(shared.map(sharedHow))].map((h) => t(`u.how.${h}`)).join(' · ')})
                      </span>
                    </>
                  )}
                  {matched.length > 0 && (
                    <span className="text-xs text-stone-400 self-center">
                      · {t('common.matchedTerms')}: <span className="text-stone-600">{matched.join(', ')}</span>
                    </span>
                  )}
                </div>

                <div className="mx-4 mt-3 bg-amber-50/70 border border-amber-100 rounded-lg p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 mb-1.5">{t('compare.why')}</p>
                  {shared.length > 0 ? (
                    <ul className="space-y-1.5">
                      {shared.map((m) => {
                        const motif = motifById.get(sharedId(m))
                        if (!motif) return null
                        return (
                          <li key={sharedId(m)} className="text-xs text-stone-600 leading-relaxed">
                            <span className="font-semibold text-stone-800">{L(motif.name)} ({motif.code})</span>{' '}
                            <span className="text-amber-700/80">[{t(`u.how.${sharedHow(m)}`)}]</span>{' '}
                            {L(motif.description)} — <span className="italic">“{L(text.title)}”</span>{' '}
                            <span className="text-stone-500">{t('compare.carriesSame')}</span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-500 leading-relaxed">{t('compare.noSharedMotif')}</p>
                  )}
                  {matched.length > 0 && (
                    <p className="text-xs text-stone-500 mt-1.5">
                      {t('compare.matchedWording')}: <span className="text-stone-600">{matched.join(', ')}</span>
                    </p>
                  )}
                </div>

                <div className="p-4 space-y-2.5">
                  {best.map((d) => (
                    <div key={d.pid} className="bg-stone-50 border border-stone-100 rounded-lg p-3.5">
                      <p className="text-sm leading-relaxed text-stone-700 font-serif">
                        “<Highlight text={d.raw} terms={matched} />”
                      </p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[11px] text-stone-400">
                          {t('common.excerptCondensed')} {d.pid} · {L(text.title)}
                        </span>
                        <SaveButton
                          item={{
                            type: 'excerpt',
                            ref: `${text.id}:${d.pid}`,
                            title: `${L(text.title)} — ${t('common.excerptCondensed')} ${d.pid}`,
                            subtitle: L(text.region),
                            text: d.raw,
                            meta: { textId: text.id, passageId: d.pid },
                          }}
                        />
                      </div>
                    </div>
                  ))}
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
