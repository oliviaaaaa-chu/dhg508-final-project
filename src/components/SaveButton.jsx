import { useI18n } from '../i18n/index.jsx'
import { useNotebook } from '../store/notebook.js'
import { SaveIcon, CheckIcon } from './Icons.jsx'

export default function SaveButton({ item, className = '', label = true }) {
  const { t } = useI18n()
  const add = useNotebook((s) => s.add)
  const has = useNotebook((s) => s.has)
  const saved = has(item)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!saved) add(item)
      }}
      disabled={saved}
      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
        saved
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-800 hover:text-white hover:border-stone-800'
      } ${className}`}
      title={saved ? t('common.saved') : t('common.save')}
    >
      {saved ? <CheckIcon className="w-3.5 h-3.5" /> : <SaveIcon className="w-3.5 h-3.5" />}
      {label && <span>{saved ? t('common.saved') : t('common.save')}</span>}
    </button>
  )
}
