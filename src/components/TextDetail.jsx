import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { textById, motifById, related, ensureMatrix, matrixIsReady } from '../lib/search.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import SaveButton from './SaveButton.jsx'
import MotifChip from './MotifChip.jsx'
import { CloseIcon } from './Icons.jsx'

// One excerpt. When a Chinese translation exists and the interface is in
// Traditional Chinese, the translation is shown first (clearly labelled — it
// is an AI translation, not the public-domain original) with a toggle back
// to the English source text.
function PassageCard({ p, title, region, textId }) {
  const { t, lang } = useI18n()
  const [showOriginal, setShowOriginal] = useState(false)
  const hasZh = typeof p.zh === 'string' && p.zh.trim().length > 0
  const showZh = lang === 'zh-TW' && hasZh && !showOriginal
  const body = showZh ? p.zh : p.text
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3.5">
      {showZh && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2 inline-block">
          {t('common.translationNote')}
        </p>
      )}
      <p className={`text-sm leading-relaxed text-stone-700 font-serif ${showZh ? '' : ''}`}>“{body}”</p>
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[11px] text-stone-400">
          {t('common.excerptCondensed')} {p.id}
        </span>
        <div className="flex items-center gap-2">
          {hasZh && (
            <button
              onClick={() => setShowOriginal((s) => !s)}
              className="text-[11px] text-stone-500 border border-stone-200 rounded-full px-2 py-0.5 hover:text-stone-900 hover:border-stone-400 transition-colors"
            >
              {showOriginal ? t('common.showTranslation') : t('common.showOriginal')}
            </button>
          )}
          <SaveButton
            item={{
              type: 'excerpt',
              ref: `${textId}:${p.id}`,
              title: `${title} — ${t('common.excerptCondensed')} ${p.id}`,
              subtitle: region,
              text: body,
              meta: { textId, passageId: p.id, lang: showZh ? 'zh-TW' : 'en' },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function TextDetail({ id, onClose, onOpenRelated }) {
  const { t, L } = useI18n()
  const [matrixReady, setMatrixReady] = useState(matrixIsReady())
  useEffect(() => {
    if (!matrixReady) ensureMatrix().then(setMatrixReady)
  }, [matrixReady])
  const text = textById.get(id)
  if (!text) return null
  const relatedTexts = matrixReady ? related(id, 3) : []

  return (
    <div className="fixed inset-y-0 right-0 z-[1200] w-full max-w-md bg-stone-50 shadow-2xl border-l border-stone-200 flex flex-col">
      <div className="flex items-start justify-between gap-4 p-5 border-b border-stone-200 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: tradColor(text.tradition) }} />
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {L(TRADITIONS[text.tradition] || { en: text.tradition })}
            </span>
            {text.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-200 text-stone-600 rounded-full px-2 py-0.5">
                {t(`db.cat.${text.category}`)}
              </span>
            )}
          </div>
          <h2 className="text-xl font-display font-semibold leading-snug">{L(text.title)}</h2>
          <p className="text-sm text-stone-500 mt-1">
            {L(text.region)} · {text.period}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500" title={t('common.close')}>
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">{t('common.summary')}</h3>
          <p className="text-sm leading-relaxed text-stone-700">{L(text.summary)}</p>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{t('common.motifs')}</h3>
          <div className="flex flex-wrap gap-1.5">
            {text.motifs.map((m) => (
              <MotifChip key={m} motif={motifById.get(m)} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">{t('common.passages')}</h3>
          <div className="space-y-2.5">
            {text.passages.map((p) => (
              <PassageCard key={p.id} p={p} title={L(text.title)} region={L(text.region)} textId={text.id} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">{t('common.source')}</h3>
          <div className="text-sm text-stone-600 space-y-0.5">
            <p>{text.source.work}</p>
            <p>{text.source.archive}</p>
            {text.source.url && (
              <a href={text.source.url} target="_blank" rel="noreferrer" className="text-amber-700 hover:underline break-all">
                {text.source.url}
              </a>
            )}
          </div>
        </section>

        {relatedTexts.length > 0 && onOpenRelated && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Closest parallels</h3>
            <div className="space-y-1.5">
              {relatedTexts.map(({ text: rt, sim }) => (
                <button
                  key={rt.id}
                  onClick={() => onOpenRelated(rt.id)}
                  className="w-full text-left bg-white border border-stone-200 rounded-lg p-3 hover:border-stone-400 transition-colors flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tradColor(rt.tradition) }} />
                  <span className="flex-1 text-sm font-medium text-stone-700">{L(rt.title)}</span>
                  <span className="text-xs text-stone-400">{Math.round(sim * 100)}%</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="flex items-center justify-between pt-2 border-t border-stone-200">
          <span className="text-[11px] text-stone-400">
            {text.lat.toFixed(2)}°, {text.lon.toFixed(2)}° · {t('common.sampleCorpus')}
          </span>
          <SaveButton
            item={{
              type: 'text',
              ref: text.id,
              title: L(text.title),
              subtitle: `${L(TRADITIONS[text.tradition] || { en: text.tradition })} · ${L(text.region)}`,
              text: L(text.summary),
              meta: { textId: text.id, motifs: text.motifs },
            }}
          />
        </section>
      </div>
    </div>
  )
}
