import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { useNotebook } from '../store/notebook.js'
import { CloseIcon, NotebookIcon } from '../components/Icons.jsx'

const TYPE_KEYS = {
  text: 'notebook.type.text',
  excerpt: 'notebook.type.excerpt',
  map: 'notebook.type.map',
  network: 'notebook.type.network',
  chat: 'notebook.type.chat',
  note: 'notebook.type.note',
}

const TYPE_COLORS = {
  text: 'bg-amber-100 text-amber-800',
  excerpt: 'bg-emerald-100 text-emerald-800',
  map: 'bg-sky-100 text-sky-800',
  network: 'bg-violet-100 text-violet-800',
  chat: 'bg-rose-100 text-rose-800',
  note: 'bg-stone-200 text-stone-700',
}

export default function NotebookView() {
  const { t, lang } = useI18n()
  const items = useNotebook((s) => s.items)
  const remove = useNotebook((s) => s.remove)
  const setNote = useNotebook((s) => s.setNote)
  const clear = useNotebook((s) => s.clear)
  const [filter, setFilter] = useState('all')
  const [copied, setCopied] = useState(false)

  const shown = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  )

  const exportJSON = () => {
    const data = JSON.stringify({ project: 'Motif Atlas — DHG508', exportedAt: new Date().toISOString(), items }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `motif-atlas-notebook-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toMarkdown = () => {
    const lines = items.map((i) => {
      const head = `## [${i.type}] ${i.title}`
      const sub = i.subtitle ? `*${i.subtitle}*` : ''
      const body = i.text ? `> ${i.text}` : ''
      const note = i.note ? `\n**Note:** ${i.note}` : ''
      return [head, sub, body, note].filter(Boolean).join('\n')
    })
    return `# Motif Atlas — Notebook\n\n${lines.join('\n\n')}`
  }

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      void copied
    }
  }

  const types = ['all', 'text', 'excerpt', 'map', 'network', 'chat']

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-display font-semibold">{t('notebook.title')}</h2>
            <p className="text-sm text-stone-500 mt-1">{t('notebook.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJSON} className="text-xs font-medium rounded-lg px-3 py-2 border border-stone-300 bg-white hover:bg-stone-800 hover:text-white">
              {t('common.exportJSON')}
            </button>
            <button onClick={copyMarkdown} className="text-xs font-medium rounded-lg px-3 py-2 border border-stone-300 bg-white hover:bg-stone-800 hover:text-white">
              {copied ? t('common.copied') : t('common.copyMarkdown')}
            </button>
            {items.length > 0 && (
              <button onClick={clear} className="text-xs font-medium rounded-lg px-3 py-2 border border-red-200 bg-white text-red-600 hover:bg-red-50">
                {t('common.clearAll')}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-5 mb-4">
          {types.map((ty) => (
            <button
              key={ty}
              onClick={() => setFilter(ty)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === ty ? 'bg-stone-900 text-amber-50 border-stone-900' : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
              }`}
            >
              {ty === 'all' ? t('common.all') : `${t(TYPE_KEYS[ty])} (${items.filter((i) => i.type === ty).length})`}
            </button>
          ))}
        </div>

        {shown.length === 0 && (
          <div className="text-sm text-stone-400 bg-white border border-dashed border-stone-300 rounded-xl p-10 text-center">
            <NotebookIcon className="w-8 h-8 mx-auto mb-3 text-stone-300" />
            {t('common.empty')}
          </div>
        )}

        <div className="space-y-3 pb-10">
          {shown.map((i) => (
            <article key={i.uid} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 shrink-0 ${TYPE_COLORS[i.type] || TYPE_COLORS.note}`}>
                  {t(TYPE_KEYS[i.type] || TYPE_KEYS.note)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-stone-800 leading-snug">{i.title}</h3>
                  {i.subtitle && <p className="text-xs text-stone-400 mt-0.5">{i.subtitle}</p>}
                  {i.text && <p className="text-sm text-stone-600 font-serif leading-relaxed mt-2 line-clamp-4">“{i.text}”</p>}
                </div>
                <button onClick={() => remove(i.uid)} className="p-1.5 rounded-full text-stone-300 hover:text-red-500 shrink-0" title={t('common.remove')}>
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={i.note || ''}
                onChange={(e) => setNote(i.uid, e.target.value)}
                placeholder={t('common.addNote')}
                rows={2}
                className="w-full mt-3 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
              />
              <p className="text-[10px] text-stone-300 mt-1.5 text-right">
                {new Date(i.createdAt).toLocaleString(lang === 'zh-TW' ? 'zh-TW' : 'en')}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
