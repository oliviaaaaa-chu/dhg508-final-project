import { useI18n } from '../i18n/index.jsx'
import { motifById } from '../lib/search.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import MotifChip from './MotifChip.jsx'

// "How the engine read your input" — the interpretive-transparency panel
// shown on Search and Compare. Everything it shows is what the engine
// actually used: the cleaned content, the concepts it recognized (and how
// it recognized them), what it deliberately excluded, and which traditions
// the visitor mentioned. Both the semantic and the keyword engine honour
// these readings, so the panel is shown in either mode.
export default function UnderstandingPanel({ u }) {
  const { t, L } = useI18n()
  if (!u) return null

  const allMotifs = [
    ...u.motifs.literal.map((m) => ({ ...m, how: 'keyword' })),
    ...u.motifs.implied.map((m) => ({ ...m, how: 'implied' })),
    ...u.motifs.meaning.map((m) => ({ ...m, how: 'meaning' })),
  ]
  const howClass = {
    keyword: 'bg-stone-100 text-stone-500 border-stone-200',
    implied: 'bg-amber-50 text-amber-700 border-amber-200',
    meaning: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  const hasAny =
    allMotifs.length > 0 ||
    u.traditions.length > 0 ||
    u.negated.motifs.length > 0 ||
    u.negated.terms.length > 0

  return (
    <div data-testid="understanding-panel" className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2.5">{t('u.title')}</p>

      <div className="space-y-2.5">
        <div>
          <span className="text-xs text-stone-400">{t('u.core')}: </span>
          <span className="text-sm text-stone-700 font-serif italic">“{u.core || u.raw}”</span>
        </div>

        {u.removedFiller.length > 0 && (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs text-stone-400">{t('u.ignored')}:</span>
            <span className="text-xs text-stone-400 line-through">{u.removedFiller.join(', ')}</span>
          </div>
        )}

        {u.question && (
          <p className="text-xs text-stone-500">↳ {t('u.question')}</p>
        )}

        {u.beats > 1 && (
          <p className="text-xs text-stone-500">
            ↳ {t('u.beats')}: <span className="font-semibold text-stone-700">{u.beats}</span>
          </p>
        )}

        {u.traditions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400">{t('u.traditions')}:</span>
            {u.traditions.map((trad) => (
              <span
                key={trad.id}
                className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-full px-2.5 py-0.5 text-xs text-stone-600"
                title={trad.matched}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: tradColor(trad.id) }} />
                {L(TRADITIONS[trad.id] || { en: trad.id })}
              </span>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs text-stone-400 mb-1.5">{t('u.motifs')}</p>
          {allMotifs.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {allMotifs.map((m) => (
                <span key={`${m.how}-${m.id}`} className="inline-flex items-center gap-1.5">
                  <MotifChip motif={motifById.get(m.id)} />
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${howClass[m.how]}`}
                    title={m.how === 'meaning' ? `cos ${m.score?.toFixed(2)}` : (m.matched || '').toString()}
                  >
                    {t(`u.how.${m.how}`)}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">{t('u.none')}</p>
          )}
        </div>

        {(u.negated.motifs.length > 0 || u.negated.terms.length > 0) && (
          <div>
            <p className="text-xs text-stone-400 mb-1.5">{t('u.excluded')}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {u.negated.motifs.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-full px-2.5 py-0.5 text-xs text-stone-500 line-through"
                  title={m.matched}
                >
                  {L(motifById.get(m.id)?.name) || m.id}
                </span>
              ))}
              {u.negated.terms.map((term) => (
                <span
                  key={term}
                  className="inline-flex items-center bg-stone-50 border border-stone-300 rounded-full px-2.5 py-0.5 text-xs text-stone-500 line-through"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!hasAny && (
        <p className="text-xs text-stone-400 mt-2 leading-snug">{t('u.semanticOnly')}</p>
      )}
    </div>
  )
}
