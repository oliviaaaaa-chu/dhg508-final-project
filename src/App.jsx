import { useState } from 'react'
import { useI18n } from './i18n/index.jsx'
import { texts, motifs } from './lib/search.js'
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

export default function App() {
  const { t } = useI18n()
  const [view, setView] = useState('search')
  const [detailId, setDetailId] = useState(null)

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
