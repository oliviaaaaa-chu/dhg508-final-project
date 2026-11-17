import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { texts, motifById } from '../lib/search.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import SaveButton from '../components/SaveButton.jsx'
import MotifChip from '../components/MotifChip.jsx'

const CATS = [
  { id: 'myth', key: 'db.cat.myth', descKey: 'db.cat.myth.desc', shortKey: 'db.cat.myth.short' },
  { id: 'myth-religion', key: 'db.cat.myth-religion', descKey: 'db.cat.myth-religion.desc', shortKey: 'db.cat.myth-religion.short' },
  { id: 'religious', key: 'db.cat.religious', descKey: 'db.cat.religious.desc', shortKey: 'db.cat.religious.short' },
]

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function TextCard({ tx, onOpen }) {
  const { t, L } = useI18n()
  return (
    <article className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-2 hover:border-stone-400 transition-colors">
      <div className="flex items-start gap-2.5">
        <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: tradColor(tx.tradition) }} />
        <button onClick={() => onOpen(tx.id)} className="flex-1 text-left group min-w-0">
          <h4 className="font-display font-semibold text-stone-800 text-sm leading-snug group-hover:underline">{L(tx.title)}</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {L(tx.region)} · {tx.period}
          </p>
        </button>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{L(tx.summary)}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex flex-wrap gap-1">
          {tx.motifs.map((m) => (
            <MotifChip key={m} motif={motifById.get(m)} />
          ))}
        </div>
        <SaveButton
          item={{
            type: 'text',
            ref: tx.id,
            title: L(tx.title),
            subtitle: `${L(TRADITIONS[tx.tradition] || { en: tx.tradition })} · ${L(tx.region)}`,
            text: L(tx.summary),
            meta: { textId: tx.id, motifs: tx.motifs, category: tx.category },
          }}
        />
      </div>
    </article>
  )
}

export default function DatabaseView({ onOpen }) {
  const { t, L, lang } = useI18n()
  const [catFilter, setCatFilter] = useState('all')
  const [tradFilter, setTradFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState({})

  const traditions = useMemo(() => [...new Set(texts.map((x) => x.tradition))].sort(), [])
  const catCounts = useMemo(() => {
    const c = { myth: 0, 'myth-religion': 0, religious: 0 }
    for (const tx of texts) if (c[tx.category] !== undefined) c[tx.category] += 1
    return c
  }, [])

  const passes = (tx) => {
    if (tradFilter !== 'all' && tx.tradition !== tradFilter) return false
    const q = query.trim().toLowerCase()
    if (q) {
      const hay = `${tx.title.en} ${tx.title.zh} ${tx.region.en} ${tx.region.zh} ${tx.period} ${tx.summary.en} ${tx.summary.zh} ${tx.motifs.join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }

  const filtered = texts.filter((tx) => passes(tx))
  const passagesTotal = filtered.reduce((n, tx) => n + tx.passages.length, 0)

  const groupName = (trad, catId) => {
    const tradName = L(TRADITIONS[trad] || { en: trad })
    const short = t(CATS.find((c) => c.id === catId).shortKey)
    return lang === 'zh' || lang === 'zh-TW' ? `${tradName}${short}` : `${tradName} ${short}`
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-display font-semibold">{t('db.title')}</h2>
        <p className="text-sm text-stone-500 mt-1 mb-5">{t('db.subtitle')}</p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            <button
              onClick={() => setCatFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                catFilter === 'all' ? 'bg-stone-900 text-amber-50 border-stone-900' : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
              }`}
            >
              {t('db.allCats')} ({texts.length})
            </button>
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  catFilter === c.id ? 'bg-stone-900 text-amber-50 border-stone-900' : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
                }`}
              >
                {t(c.key)} ({catCounts[c.id] || 0})
              </button>
            ))}
          </div>
          <select
            value={tradFilter}
            onChange={(e) => setTradFilter(e.target.value)}
            className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">{t('common.tradition')}: {t('common.all')}</option>
            {traditions.map((id) => (
              <option key={id} value={id}>
                {L(TRADITIONS[id] || { en: id })}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('db.searchPlaceholder')}
            className="flex-1 min-w-40 text-xs bg-white border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
          />
        </div>

        <p className="text-xs text-stone-400 mt-4">
          {filtered.length} {t('db.texts')} · {passagesTotal} {t('common.passages')}
        </p>
        <p className="text-[11px] text-stone-400 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 mt-2 leading-snug">{t('db.note')}</p>

        {filtered.length === 0 && (
          <div className="text-sm text-stone-400 bg-white border border-dashed border-stone-300 rounded-xl p-8 text-center mt-5">{t('search.noResults')}</div>
        )}

        {CATS.map((c) => {
          const catTexts = filtered.filter((tx) => tx.category === c.id)
          if (catTexts.length === 0) return null
          if (catFilter !== 'all' && catFilter !== c.id) return null

          const groups = Object.values(
            catTexts.reduce((acc, tx) => {
              acc[tx.tradition] = acc[tx.tradition] || { tradition: tx.tradition, list: [], passages: 0 }
              acc[tx.tradition].list.push(tx)
              acc[tx.tradition].passages += tx.passages.length
              return acc
            }, {})
          ).sort((a, b) => b.list.length - a.list.length)

          return (
            <section key={c.id} className="mt-7">
              <h3 className="font-display text-lg font-semibold text-stone-800">
                {t(c.key)} <span className="text-sm font-normal text-stone-400">({catTexts.length})</span>
              </h3>
              <p className="text-xs text-stone-400">{t(c.descKey)}</p>
              <p className="text-[11px] text-stone-400 mt-2 mb-2">{t('db.groupHint')}</p>

              <div className="space-y-2">
                {groups.map((g) => {
                  const key = `${c.id}:${g.tradition}`
                  const isOpen = !!open[key]
                  return (
                    <div key={key} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 text-left"
                      >
                        <Chevron open={isOpen} />
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tradColor(g.tradition) }} />
                        <span className="font-display font-semibold text-stone-800">{groupName(g.tradition, c.id)}</span>
                        <span className="ml-auto text-xs text-stone-400 shrink-0">
                          {g.list.length} {t('db.texts')} · {g.passages} {t('common.passages')}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {g.list.map((tx) => (
                            <TextCard key={tx.id} tx={tx} onOpen={onOpen} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        <div className="h-10" />
      </div>
    </div>
  )
}
