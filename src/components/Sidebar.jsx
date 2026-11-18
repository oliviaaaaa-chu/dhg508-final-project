import { useI18n } from '../i18n/index.jsx'
import { useNotebook } from '../store/notebook.js'
import { SearchIcon, CompareIcon, LibraryIcon, MapIcon, NetworkIcon, EmbeddingIcon, ChatIcon, NotebookIcon } from './Icons.jsx'

const VIEWS = [
  { id: 'search', icon: SearchIcon, key: 'nav.search' },
  { id: 'compare', icon: CompareIcon, key: 'nav.compare' },
  { id: 'database', icon: LibraryIcon, key: 'nav.database' },
  { id: 'map', icon: MapIcon, key: 'nav.map' },
  { id: 'network', icon: NetworkIcon, key: 'nav.network' },
  { id: 'embedding', icon: EmbeddingIcon, key: 'nav.embedding' },
  { id: 'chat', icon: ChatIcon, key: 'nav.chat' },
  { id: 'notebook', icon: NotebookIcon, key: 'nav.notebook' },
]

export default function Sidebar({ view, setView }) {
  const { t, lang, setLang } = useI18n()
  const count = useNotebook((s) => s.items.length)

  return (
    <nav className="flex md:flex-col flex-row md:w-56 w-full shrink-0 bg-stone-900 text-stone-300 overflow-x-auto md:overflow-visible">
      <div className="hidden md:block px-5 pt-6 pb-5 border-b border-stone-800">
        <p className="font-display text-amber-100 text-lg leading-tight font-semibold">{t('app.title')}</p>
        <p className="text-[11px] text-stone-500 mt-1">{t('app.subtitle')}</p>
        <button
          onClick={() => setLang(lang === 'en' ? 'zh-TW' : 'en')}
          className="mt-3 text-[11px] text-stone-400 border border-stone-700 rounded-full px-2.5 py-1 hover:text-amber-100 hover:border-amber-500 transition-colors"
        >
          {t('lang.switch')}
        </button>
      </div>

      <ul className="flex md:flex-col flex-row md:flex-1 md:py-4">
        {VIEWS.map(({ id, icon: Icon, key }) => {
          const active = view === id
          return (
            <li key={id} className="shrink-0">
              <button
                onClick={() => setView(id)}
                className={`w-full md:px-5 px-4 py-3 md:py-2.5 flex items-center gap-3 text-sm transition-colors relative ${
                  active ? 'text-amber-100 bg-stone-800' : 'hover:text-white hover:bg-stone-800/60'
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 md:h-6 h-0.5 md:w-0.5 w-6 bg-amber-400" />}
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="whitespace-nowrap">{t(key)}</span>
                {id === 'notebook' && count > 0 && (
                  <span className="ml-auto bg-amber-500 text-stone-900 text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 inline-flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
