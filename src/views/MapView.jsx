import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '../i18n/index.jsx'
import { texts, motifs, search } from '../lib/search.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import SaveButton from '../components/SaveButton.jsx'
import MotifChip from '../components/MotifChip.jsx'

export default function MapView({ onOpen }) {
  const { t, L: loc } = useI18n()
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const layerRef = useRef(null)
  const [motifFilter, setMotifFilter] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState(null)
  const [tileStatus, setTileStatus] = useState(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const keywordMatches = useMemo(() => {
    if (!keyword.trim()) return null
    const s = new Set(search(keyword, 'keyword').map((r) => r.text.id))
    return s
  }, [keyword])

  const filtered = useMemo(() => {
    return texts.filter((tx) => {
      if (motifFilter !== 'all' && !tx.motifs.includes(motifFilter)) return false
      if (keywordMatches !== null && !keywordMatches.has(tx.id)) return false
      return true
    })
  }, [motifFilter, keywordMatches])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    mapRef.current = L.map(containerRef.current, {
      center: [18, 30],
      zoom: 2,
      minZoom: 2,
      worldCopyJump: true,
    })

    const PROVIDERS = [
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri — Source: US National Park Service',
        maxZoom: 8,
      },
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 13,
      },
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 13,
      },
    ]

    let idx = 0
    let errors = 0
    let tiles = null

    const attach = (i) => {
      idx = i
      errors = 0
      if (tiles) mapRef.current.removeLayer(tiles)
      tiles = L.tileLayer(PROVIDERS[i].url, {
        attribution: PROVIDERS[i].attribution,
        maxZoom: PROVIDERS[i].maxZoom,
      })
      mapRef.current.setMaxZoom(PROVIDERS[i].maxZoom)
      tiles.on('tileerror', () => {
        errors += 1
        if (errors >= 5) {
          if (i + 1 < PROVIDERS.length) {
            setTileStatus(`tiles failed — trying backup provider ${i + 2} of ${PROVIDERS.length}…`)
            attach(i + 1)
          } else {
            setTileStatus('failed')
          }
        }
      })
      tiles.addTo(mapRef.current)
    }
    attach(0)

    layerRef.current = L.layerGroup().addTo(mapRef.current)
    setTimeout(() => mapRef.current?.invalidateSize(), 100)
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const group = layerRef.current
    if (!group) return
    group.clearLayers()
    for (const tx of filtered) {
      const n = motifFilter === 'all' ? 1 : tx.motifs.filter((m) => m === motifFilter).length
      const radius = motifFilter === 'all' ? 8 : 9 + n * 2
      const marker = L.circleMarker([tx.lat, tx.lon], {
        radius,
        color: tradColor(tx.tradition),
        fillColor: tradColor(tx.tradition),
        fillOpacity: 0.45,
        weight: 2,
      })
      marker.bindTooltip(loc(tx.title), { direction: 'top', offset: [0, -radius] })
      marker.on('click', () => setSelected(tx))
      marker.addTo(group)
    }
  }, [filtered, motifFilter])

  const sel = selected

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col min-h-[45%] relative">
        <div ref={containerRef} className="absolute inset-0" />

        {tileStatus && (
          <div className="absolute top-3 right-3 z-[500] bg-amber-50 border border-amber-300 rounded-xl shadow-sm p-3 max-w-[250px]">
            <p className="text-xs text-amber-900 font-semibold">
              {tileStatus === 'failed' ? 'Map background unavailable' : 'Switching map background…'}
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
              {tileStatus === 'failed'
                ? 'All key-free tile providers are unreachable from your network. The markers still work — they are drawn locally. A VPN or different network may fix the background.'
                : 'The first tile provider is not responding; trying a backup. Markers are unaffected.'}
            </p>
          </div>
        )}
        <div className="absolute top-3 left-3 z-[500] bg-white/95 backdrop-blur border border-stone-200 rounded-xl shadow-sm p-2.5 space-y-2.5 w-64 max-w-[80%]">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 hover:text-stone-600"
          >
            <span>{t('map.filterMotif')} · {t('map.filterKeyword')}</span>
            <span className="text-stone-400 text-xs leading-none">{filtersOpen ? '▾' : '▸'}</span>
          </button>
          {filtersOpen && (
            <>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">{t('map.filterMotif')}</label>
                <select
                  value={motifFilter}
                  onChange={(e) => setMotifFilter(e.target.value)}
                  className="w-full text-sm bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">{t('common.all')}</option>
                  {motifs.map((m) => (
                    <option key={m.id} value={m.id}>
                      {loc(m.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">{t('map.filterKeyword')}</label>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full text-sm bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                {t('map.showing')} {filtered.length} · {t('map.hint')}
              </p>
              <p className="text-[11px] text-stone-400 leading-snug border-t border-stone-200 pt-2">
                {t('map.disclaimer')}
              </p>
            </>
          )}
        </div>

        <div className="absolute bottom-3 left-3 z-[500] bg-white/95 backdrop-blur border border-stone-200 rounded-xl shadow-sm p-2.5 max-w-xs">
          <button
            onClick={() => setLegendOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 hover:text-stone-600"
          >
            <span>{t('map.legend')}</span>
            <span className="text-stone-400 text-xs leading-none">{legendOpen ? '▾' : '▸'}</span>
          </button>
          {legendOpen && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              {Object.entries(TRADITIONS).map(([id, tr]) => (
                <span key={id} className="inline-flex items-center gap-1 text-[10px] text-stone-600">
                  <span className="w-2 h-2 rounded-full" style={{ background: tr.color }} />
                  {loc({ en: tr.en, zh: tr.zh })}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="w-full md:w-96 shrink-0 bg-stone-50 border-t md:border-t-0 md:border-l border-stone-200 overflow-y-auto">
        {sel ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: tradColor(sel.tradition) }} />
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                {loc(TRADITIONS[sel.tradition] || { en: sel.tradition })}
              </span>
            </div>
            <h3 className="text-xl font-display font-semibold leading-snug">{loc(sel.title)}</h3>
            <p className="text-sm text-stone-500">
              {loc(sel.region)} · {sel.period} · {sel.lat.toFixed(2)}°, {sel.lon.toFixed(2)}°
            </p>
            <p className="text-sm leading-relaxed text-stone-700">{loc(sel.summary)}</p>
            <div className="flex flex-wrap gap-1.5">
              {sel.motifs.map((m) => (
                <MotifChip key={m} motif={motifs.find((x) => x.id === m)} />
              ))}
            </div>
            {sel.passages.slice(0, 1).map((p) => (
              <div key={p.id} className="bg-white border border-stone-200 rounded-lg p-3.5">
                <p className="text-sm leading-relaxed text-stone-700 font-serif">“{p.text}”</p>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <SaveButton
                item={{
                  type: 'map',
                  ref: `${sel.id}@${motifFilter}`,
                  title: loc(sel.title),
                  subtitle: `${loc(sel.region)} · ${t(motifFilter === 'all' ? 'common.all' : 'common.motifs')}: ${
                    motifFilter === 'all' ? '—' : loc(motifs.find((x) => x.id === motifFilter).name)
                  }`,
                  text: loc(sel.summary),
                  meta: { lat: sel.lat, lon: sel.lon, textId: sel.id, motifFilter },
                }}
              />
              <button
                onClick={() => onOpen(sel.id)}
                className="text-xs font-medium rounded-full px-3 py-1.5 border border-stone-300 bg-white text-stone-600 hover:bg-stone-800 hover:text-white"
              >
                {t('common.openDetails')}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-stone-400">{t('map.hint')}</div>
        )}
      </aside>
    </div>
  )
}
