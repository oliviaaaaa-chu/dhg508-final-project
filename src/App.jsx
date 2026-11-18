import { useEffect, useState } from 'react'
import { useI18n } from './i18n/index.jsx'
import { texts, motifs, ensureCorpus } from './lib/search.js'
import Sidebar from './components/Sidebar.jsx'
import TextDetail from './components/TextDetail.jsx'
import SearchView from './views/SearchView.jsx'
import CompareView from './views/CompareView.jsx'
import DatabaseView from './views/DatabaseView.jsx'
import MapView from './views/MapView.jsx'
import NetworkView from './views/NetworkView.jsx'
import EmbeddingView from './views/EmbeddingView.jsx'
import NotebookView from './views/NotebookView.jsx'
import ChatView from './views/ChatView.jsx'

function CorpusLoader({ onReady }) {
  const { t } = useI18n()
  const [error, setError] = useState(null)
  useEffect(() => {
    let alive = true
    ensureCorpus()
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && onReady())
    return () => {
      alive = false
    }
  }, [])
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-stone-100 p-8 text-center">
        <p className="text-sm text-stone-700">Could not load the corpus. Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium rounded-lg px-4 py-2 bg-stone-900 text-amber-50 hover:bg-stone-700"
        >
          Retry
        </button>
        <p className="text-[11px] text-stone-400 max-w-sm break-all">{error}</p>
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-stone-100">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      <p className="text-sm text-stone-500">{t('app.loading')}</p>
      <p className="text-[11px] text-stone-400">{t('app.loadingNote')}</p>
    </div>
  )
}

export default function App() {
  const { t, lang, setLang } = useI18n()
  const [corpusReady, setCorpusReady] = useState(false)
  const [view, setView] = useState('search')
  const [detailId, setDetailId] = useState(null)

  if (!corpusReady) return <CorpusLoader onReady={() => setCorpusReady(true)} />

  const traditions = new Set(texts.map((x) => x.tradition))

  return (
    <div className="h-full flex flex-col md:flex-row">
      <Sidebar view={view} setView={setView} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-stone-200">
          <div className="md:hidden">
            <p className="font-display text-stone-900 font-semibold leading-tight">{t('app.title')}</p>
            <p className="text-[10px] text-stone-400">{t('app.subtitle')}</p>
          </div>
          <div className="hidden md:block text-xs text-stone-400">
            {texts.length} {t('common.sampleCorpus')} · {traditions.size} {t('common.tradition')} · {motifs.length} {t('common.motifs')}
          </div>
          <button
            onClick={() => setLang(lang === 'en' ? 'zh-TW' : 'en')}
            className="text-[11px] text-stone-500 border border-stone-200 rounded-full px-2.5 py-1 hover:text-stone-900 hover:border-stone-500 transition-colors"
          >
            {t('lang.switch')}
          </button>
        </header>

        <main className="flex-1 min-h-0 relative bg-stone-100">
          {view === 'search' && <SearchView onOpen={setDetailId} />}
          {view === 'compare' && <CompareView onOpen={setDetailId} />}
          {view === 'database' && <DatabaseView onOpen={setDetailId} />}
          {view === 'map' && <MapView onOpen={setDetailId} />}
          {view === 'network' && <NetworkView onOpen={setDetailId} />}
          {view === 'embedding' && <EmbeddingView onOpen={setDetailId} />}
          {view === 'notebook' && <NotebookView />}
          {view === 'chat' && <ChatView onOpen={setDetailId} />}
        </main>

        <footer className="px-6 py-2 bg-white border-t border-stone-200 flex flex-wrap gap-x-6 gap-y-1">
          <p className="text-[10px] text-stone-400">{t('footer.sample')}</p>
          <p className="text-[10px] text-stone-400">{t('footer.ethics')}</p>
        </footer>
      </div>

      {detailId && <TextDetail id={detailId} onClose={() => setDetailId(null)} onOpenRelated={setDetailId} />}
    </div>
  )
}
