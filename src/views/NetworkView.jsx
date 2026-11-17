import { useEffect, useMemo, useRef, useState } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { useI18n } from '../i18n/index.jsx'
import { graph, textById, motifById, similarity } from '../lib/search.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import SaveButton from '../components/SaveButton.jsx'
import MotifChip from '../components/MotifChip.jsx'

const W = 900
const H = 620

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-3 h-3 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function toContent(e, svg) {
  const rect = svg.getBoundingClientRect()
  const s = Math.min(W / rect.width, H / rect.height)
  const offsetX = (rect.width - W / s) / 2
  const offsetY = (rect.height - H / s) / 2
  return {
    u: -W / 2 + (e.clientX - rect.left - offsetX) / s,
    v: -H / 2 + (e.clientY - rect.top - offsetY) / s,
    s,
  }
}

export default function NetworkView({ onOpen }) {
  const { t, L } = useI18n()
  const [threshold, setThreshold] = useState(0.55)
  const [selectedId, setSelectedId] = useState(null)
  const [tf, setTf] = useState({ x: 0, y: 0, k: 1 })
  const [showThreshold, setShowThreshold] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const svgRef = useRef(null)
  const drag = useRef({ lastX: 0, lastY: 0, moved: 0, active: false })

  const layout = useMemo(() => {
    const g = graph(threshold)
    const nodes = g.nodes.map((n, i) => ({
      ...n,
      x: Math.cos((i / g.nodes.length) * Math.PI * 2) * 180,
      y: Math.sin((i / g.nodes.length) * Math.PI * 2) * 140,
    }))
    const sim = forceSimulation(nodes)
      .force('link', forceLink(g.links).id((d) => d.id).distance(120).strength(0.22))
      .force('charge', forceManyBody().strength(-340))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide(30))
    sim.stop()
    for (let i = 0; i < 420; i++) sim.tick()
    return { nodes, links: g.links }
  }, [threshold])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const handler = (e) => {
      e.preventDefault()
      const { u, v } = toContent(e, svg)
      const f = e.deltaY < 0 ? 1.15 : 1 / 1.15
      setTf((t0) => {
        const k2 = Math.min(5, Math.max(0.15, t0.k * f))
        return { k: k2, x: u - (u - t0.x) * (k2 / t0.k), y: v - (v - t0.y) * (k2 / t0.k) }
      })
    }
    svg.addEventListener('wheel', handler, { passive: false })
    return () => svg.removeEventListener('wheel', handler)
  }, [])

  const zoomBy = (f) =>
    setTf((t0) => {
      const k2 = Math.min(5, Math.max(0.15, t0.k * f))
      return { k: k2, x: t0.x * (k2 / t0.k), y: t0.y * (k2 / t0.k) }
    })

  const onPointerDown = (e) => {
    drag.current = { lastX: e.clientX, lastY: e.clientY, moved: 0, active: true }
  }
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const { s } = toContent(e, svgRef.current)
    const dx = (e.clientX - drag.current.lastX) / s
    const dy = (e.clientY - drag.current.lastY) / s
    drag.current.moved += Math.abs(dx) + Math.abs(dy)
    drag.current.lastX = e.clientX
    drag.current.lastY = e.clientY
    setTf((t0) => ({ ...t0, x: t0.x + dx, y: t0.y + dy }))
  }
  const onPointerUp = () => {
    drag.current.active = false
  }
  const onNodeClick = (id) => {
    if (drag.current.moved > 2) return
    setSelectedId(id)
  }

  const sel = selectedId ? textById.get(selectedId) : null
  const neighbors = useMemo(() => {
    if (!selectedId) return []
    return layout.links
      .filter((l) => l.source.id === selectedId || l.target.id === selectedId)
      .map((l) => (l.source.id === selectedId ? l.target.id : l.source.id))
      .map((id) => ({ text: textById.get(id), sim: similarity(selectedId, id) }))
      .sort((a, b) => b.sim - a.sim)
  }, [selectedId, layout])

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 relative min-h-[50%] bg-stone-50 overflow-hidden">
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-stone-200 rounded-lg shadow-sm overflow-hidden w-44">
          <button
            onClick={() => setShowThreshold((s) => !s)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-stone-50 text-left"
          >
            <Chevron open={showThreshold} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{t('network.threshold')}</span>
            <span className="ml-auto text-[10px] text-amber-700 font-bold">{threshold.toFixed(2)}</span>
          </button>
          {showThreshold && (
            <div className="px-2.5 pb-2 space-y-1.5">
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[10px] text-stone-500">
                {layout.nodes.length} {t('network.nodes')} · {layout.links.length} {t('network.links')}
              </p>
              <p className="text-[10px] text-stone-400 leading-snug">{t('network.hint')}</p>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button onClick={() => zoomBy(1.3)} className="w-9 h-9 bg-white/95 backdrop-blur border border-stone-200 rounded-lg shadow-sm text-stone-600 hover:bg-stone-800 hover:text-white text-lg leading-none" title="Zoom in">+</button>
          <button onClick={() => zoomBy(1 / 1.3)} className="w-9 h-9 bg-white/95 backdrop-blur border border-stone-200 rounded-lg shadow-sm text-stone-600 hover:bg-stone-800 hover:text-white text-lg leading-none" title="Zoom out">−</button>
          <button onClick={() => setTf({ x: 0, y: 0, k: 1 })} className="w-9 h-9 bg-white/95 backdrop-blur border border-stone-200 rounded-lg shadow-sm text-stone-600 hover:bg-stone-800 hover:text-white text-sm" title="Reset view">↺</button>
        </div>

        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur border border-stone-200 rounded-lg shadow-sm overflow-hidden max-w-xs">
          <button
            onClick={() => setShowLegend((s) => !s)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-stone-50 text-left"
          >
            <Chevron open={showLegend} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{t('network.legend')}</span>
            <span className="ml-auto text-[10px] text-stone-400">{Object.keys(TRADITIONS).length}</span>
          </button>
          {showLegend && (
            <div className="px-2.5 pb-2 flex flex-wrap gap-x-2.5 gap-y-0.5 max-w-64">
              {Object.entries(TRADITIONS).map(([id, tr]) => (
                <span key={id} className="inline-flex items-center gap-1 text-[10px] text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tr.color }} />
                  {L({ en: tr.en, zh: tr.zh })}
                </span>
              ))}
            </div>
          )}
        </div>

        <svg
          ref={svgRef}
          viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
          className="w-full h-full select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <g transform={`translate(${tf.x},${tf.y}) scale(${tf.k})`}>
            {layout.links.map((l, i) => {
              const active = selectedId && (l.source.id === selectedId || l.target.id === selectedId)
              return (
                <line
                  key={i}
                  x1={l.source.x}
                  y1={l.source.y}
                  x2={l.target.x}
                  y2={l.target.y}
                  stroke={active ? '#b45309' : '#a8a29e'}
                  strokeWidth={active ? 2 : 1}
                  strokeOpacity={selectedId && !active ? 0.12 : 0.2 + l.weight * 0.8}
                />
              )
            })}
            {layout.nodes.map((n) => {
              const text = textById.get(n.id)
              const active = selectedId === n.id
              const r = 8 + n.deg * 1.6
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  onClick={() => onNodeClick(n.id)}
                  className="cursor-pointer"
                >
                  <circle
                    r={r}
                    fill={tradColor(text.tradition)}
                    fillOpacity={active ? 1 : 0.75}
                    stroke={active ? '#b45309' : '#fff'}
                    strokeWidth={active ? 3 : 1.5}
                  />
                  <text
                    y={r + 11}
                    textAnchor="middle"
                    className="fill-stone-600 pointer-events-none"
                    style={{ fontSize: 10.5, fontFamily: 'Georgia, serif' }}
                  >
                    {L(text.title).length > 24 ? L(text.title).slice(0, 24) + '…' : L(text.title)}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <aside className="w-full md:w-96 shrink-0 bg-white border-t md:border-t-0 md:border-l border-stone-200 overflow-y-auto">
        {sel ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: tradColor(sel.tradition) }} />
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                {L(TRADITIONS[sel.tradition] || { en: sel.tradition })}
              </span>
            </div>
            <h3 className="text-xl font-display font-semibold leading-snug">{L(sel.title)}</h3>
            <p className="text-sm text-stone-500">{L(sel.region)} · {sel.period}</p>
            <p className="text-sm leading-relaxed text-stone-700">{L(sel.summary)}</p>
            <div className="flex flex-wrap gap-1.5">
              {sel.motifs.map((m) => (
                <MotifChip key={m} motif={motifById.get(m)} />
              ))}
            </div>

            {neighbors.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">{t('common.sharedMotifs')}</p>
                <div className="space-y-1">
                  {neighbors.map(({ text: nb, sim }) => (
                    <button
                      key={nb.id}
                      onClick={() => setSelectedId(nb.id)}
                      className="w-full flex items-center gap-2 text-left bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 hover:border-stone-400"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tradColor(nb.tradition) }} />
                      <span className="flex-1 text-xs font-medium text-stone-700">{L(nb.title)}</span>
                      <span className="text-[11px] text-stone-400">{Math.round(sim * 100)}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
              <SaveButton
                item={{
                  type: 'network',
                  ref: `${sel.id}@${threshold}`,
                  title: L(sel.title),
                  subtitle: `${t('network.threshold')} ${threshold.toFixed(2)} · ${neighbors.length} ${t('network.links')}`,
                  text: L(sel.summary),
                  meta: { textId: sel.id, threshold, neighbors: neighbors.map((n) => n.text.id) },
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
          <div className="p-5 text-sm text-stone-400">{t('network.hint')}</div>
        )}
      </aside>
    </div>
  )
}
