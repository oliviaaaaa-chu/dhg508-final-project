import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useI18n } from '../i18n/index.jsx'
import { embedding3D, search, related, textById, motifById, texts } from '../lib/search.js'
import { tradColor, TRADITIONS } from '../lib/colors.js'
import SaveButton from '../components/SaveButton.jsx'
import MotifChip from '../components/MotifChip.jsx'
import { ChevronIcon, SearchIcon } from '../components/Icons.jsx'

const BG = new THREE.Color(0xf7f6f3)
const ACCENT = new THREE.Color(0xb45309)

function hexToRgb01(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
}

function rgb01ToHex(rgb) {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('')
}

function mute(hex) {
  const a = hexToRgb01(hex)
  const b = hexToRgb01('#6e6b64')
  return rgb01ToHex(a.map((v, i) => v + (b[i] - v) * 0.38))
}

const MUTED = {}
for (const [id, tr] of Object.entries(TRADITIONS)) MUTED[id] = mute(tr.color)
const MUTED_DEFAULT = mute('#78716c')
const mutedColor = (tr) => MUTED[tr] || MUTED_DEFAULT

function makeDotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.68, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  return tex
}

function makeRingTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.52, 'rgba(255,255,255,0)')
  g.addColorStop(0.66, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.82, 'rgba(255,255,255,0.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  return tex
}

function truncate(s, n = 26) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

function makeLabelSprite(text) {
  const pad = 10
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const font = '600 22px Georgia, serif'
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2
  canvas.width = w
  canvas.height = 40
  const c2 = canvas.getContext('2d')
  c2.font = font
  c2.fillStyle = 'rgba(255,255,255,0.82)'
  const r = 12
  c2.beginPath()
  c2.moveTo(r, 0)
  c2.arcTo(w, 0, w, 40, r)
  c2.arcTo(w, 40, 0, 40, r)
  c2.arcTo(0, 40, 0, 0, r)
  c2.arcTo(0, 0, w, 0, r)
  c2.closePath()
  c2.fill()
  c2.fillStyle = '#292524'
  c2.textBaseline = 'middle'
  c2.fillText(text, pad, 21)
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }))
  sprite.scale.set(w * 0.32, 40 * 0.32, 1)
  sprite.renderOrder = 10
  return sprite
}

export default function EmbeddingView({ onOpen }) {
  const { t, L } = useI18n()
  const mountRef = useRef(null)
  const stateRef = useRef(null)
  const hoverRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(true)
  const [legendOpen, setLegendOpen] = useState(false)

  const emb = useMemo(() => embedding3D(), [])

  const matches = useMemo(() => {
    if (!query.trim()) return null
    return new Set(search(query, 'keyword').map((r) => r.text.id))
  }, [query])

  const visibleIds = useMemo(() => {
    const s = new Set()
    for (const tx of texts) {
      if (catFilter !== 'all' && tx.category !== catFilter) continue
      if (matches && !matches.has(tx.id)) continue
      s.add(tx.id)
    }
    return s
  }, [catFilter, matches])

  const neighbors = useMemo(() => {
    if (!selectedId) return []
    return related(selectedId, 5)
  }, [selectedId])

  useEffect(() => {
    const container = mountRef.current
    if (!container || stateRef.current) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.setClearColor(BG)
    Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0' })
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = BG.clone()
    scene.fog = new THREE.Fog(BG.clone(), 900, 3200)

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    const bb = new THREE.Box3()
    for (const p of emb.points) bb.expandByPoint(new THREE.Vector3(p.x, p.y, p.z))
    const center = bb.getCenter(new THREE.Vector3())
    const span = bb.getSize(new THREE.Vector3()).length()
    camera.position.set(center.x + span * 0.45, center.y + span * 0.3, center.z + span * 0.75)
    controls.target.copy(center)

    const dotTex = makeDotTexture()

    const n = emb.points.length
    const ids = emb.points.map((p) => p.id)
    const idToIdx = new Map(ids.map((id, i) => [id, i]))
    const positions = new Float32Array(n * 3)
    const baseCol = new Float32Array(n * 3)
    const bgRgb = [BG.r, BG.g, BG.b]
    for (let i = 0; i < n; i++) {
      const p = emb.points[i]
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
      const tx = textById.get(p.id)
      const c = new THREE.Color(mutedColor(tx?.tradition))
      baseCol[i * 3] = c.r
      baseCol[i * 3 + 1] = c.g
      baseCol[i * 3 + 2] = c.b
    }
    const colAttr = new Float32Array(baseCol)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colAttr, 3))
    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 12,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
        alphaTest: 0.02,
      })
    )
    scene.add(points)

    const ring = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: makeRingTexture(), color: ACCENT, transparent: true, depthTest: false, opacity: 0.9 })
    )
    ring.scale.set(52, 52, 1)
    ring.renderOrder = 5
    ring.visible = false
    scene.add(ring)

    const lineGroup = new THREE.Group()
    scene.add(lineGroup)

    const labels = new Map()
    const getLabel = (id) => {
      let label = labels.get(id)
      if (!label) {
        const tx = textById.get(id)
        label = makeLabelSprite(truncate(L(tx.title)))
        const i = idToIdx.get(id)
        label.position.set(positions[i * 3], positions[i * 3 + 1] + 20, positions[i * 3 + 2])
        label.visible = false
        scene.add(label)
        labels.set(id, label)
      }
      return label
    }

    let tween = null
    const focusOnPoint = (p) => {
      const target = new THREE.Vector3(p.x, p.y, p.z)
      const dir = camera.position.clone().sub(controls.target)
      const dist = Math.max(340, Math.min(760, dir.length()))
      dir.setLength(dist)
      tween = {
        t0: performance.now(),
        dur: 700,
        camFrom: camera.position.clone(),
        camTo: target.clone().add(dir),
        tgtFrom: controls.target.clone(),
        tgtTo: target,
      }
      controls.enabled = false
    }

    const pickPoint = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const py = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const vis = stateRef.current ? stateRef.current.visibleIdsRef.current : visibleIds
      const v = new THREE.Vector3()
      let best = null
      let bestD2 = 196
      for (const [id, i] of idToIdx) {
        if (!vis.has(id)) continue
        v.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]).project(camera)
        if (v.z < -1 || v.z > 1) continue
        const dx = (v.x - px) * rect.width
        const dy = (v.y - py) * rect.height
        const d2 = dx * dx + dy * dy
        if (d2 < bestD2) {
          bestD2 = d2
          best = id
        }
      }
      return best
    }

    let downX = 0
    let downY = 0

    const onMove = (e) => {
      const id = pickPoint(e)
      if (id !== hoverRef.current) {
        hoverRef.current = id
        setHoverId(id)
      }
      renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
    }

    const onDown = (e) => {
      downX = e.clientX
      downY = e.clientY
    }

    const onClick = (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return
      const id = pickPoint(e)
      if (id) setSelectedId(id)
    }

    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('click', onClick)

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const rafRef = { current: 0 }
    const tick = () => {
      if (tween) {
        const k = Math.min(1, (performance.now() - tween.t0) / tween.dur)
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
        camera.position.lerpVectors(tween.camFrom, tween.camTo, e)
        controls.target.lerpVectors(tween.tgtFrom, tween.tgtTo, e)
        camera.lookAt(controls.target)
        if (k >= 1) {
          tween = null
          controls.enabled = true
          controls.update()
        }
      } else {
        controls.update()
      }
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    stateRef.current = {
      renderer, scene, camera, controls, ids, idToIdx, positions, baseCol, colAttr, bgRgb,
      labels, getLabel, ring, lineGroup, focusOnPoint, visibleIdsRef: { current: visibleIds },
      geo, ro, rafRef,
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      controls.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
      stateRef.current = null
    }
  }, [emb])

  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    st.visibleIdsRef.current = visibleIds
    const neighborIds = new Set(neighbors.map((nb) => nb.text.id))
    const col = st.colAttr
    const base = st.baseCol
    const bg = st.bgRgb
    for (let i = 0; i < st.ids.length; i++) {
      const id = st.ids[i]
      const inFilter = st.visibleIdsRef.current.has(id)
      const active = id === selectedId
      const isN = neighborIds.has(id)
      const dim = !inFilter ? 0.97 : !selectedId ? 0.16 : active || isN ? 0 : 0.82
      col[i * 3] = base[i * 3] + (bg[0] - base[i * 3]) * dim
      col[i * 3 + 1] = base[i * 3 + 1] + (bg[1] - base[i * 3 + 1]) * dim
      col[i * 3 + 2] = base[i * 3 + 2] + (bg[2] - base[i * 3 + 2]) * dim
      const show = inFilter && (active || isN || id === hoverId)
      const label = show ? st.getLabel(id) : st.labels.get(id)
      if (label) {
        label.visible = show
        label.material.opacity = show && selectedId && !active && !isN ? 0.5 : 1
      }
    }
    st.geo.attributes.color.needsUpdate = true
    const idx = selectedId ? st.idToIdx.get(selectedId) : null
    if (idx != null) {
      st.ring.visible = true
      st.ring.position.set(st.positions[idx * 3], st.positions[idx * 3 + 1], st.positions[idx * 3 + 2])
    } else {
      st.ring.visible = false
    }
    while (st.lineGroup.children.length) {
      const line = st.lineGroup.children.pop()
      line.geometry.dispose()
      line.material.dispose()
    }
    if (idx != null) {
      const sx = st.positions[idx * 3]
      const sy = st.positions[idx * 3 + 1]
      const sz = st.positions[idx * 3 + 2]
      for (const nb of neighbors) {
        const j = st.idToIdx.get(nb.text.id)
        if (j == null) continue
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sx, sy, sz),
          new THREE.Vector3(st.positions[j * 3], st.positions[j * 3 + 1], st.positions[j * 3 + 2]),
        ])
        st.lineGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xb45309, transparent: true, opacity: 0.5 })))
      }
    }
  }, [selectedId, neighbors, hoverId, visibleIds, emb])

  useEffect(() => {
    const st = stateRef.current
    if (!st || !selectedId) return
    const idx = st.idToIdx.get(selectedId)
    if (idx == null) return
    st.focusOnPoint({
      x: st.positions[idx * 3],
      y: st.positions[idx * 3 + 1],
      z: st.positions[idx * 3 + 2],
    })
  }, [selectedId])

  const sel = selectedId ? textById.get(selectedId) : null

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 relative min-h-[50%] bg-stone-100 overflow-hidden">
        <div ref={mountRef} className="absolute inset-0" />

        {filterOpen ? (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-stone-200 rounded-xl shadow-sm p-2.5 space-y-2 w-52 max-w-[80%]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{t('emb.filterTitle')}</p>
              <button
                onClick={() => setFilterOpen(false)}
                title={t('common.close')}
                className="p-0.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <ChevronIcon dir="up" className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {['all', 'myth', 'myth-religion', 'religious'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    catFilter === c ? 'bg-stone-900 text-amber-50 border-stone-900' : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
                  }`}
                >
                  {c === 'all' ? t('common.all') : t(`db.cat.${c}`)}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('emb.searchPlaceholder')}
              className="w-full text-[11px] bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-stone-400 leading-snug">{t('emb.axes')}</p>
          </div>
        ) : (
          <button
            onClick={() => setFilterOpen(true)}
            className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur border border-stone-200 rounded-full shadow-sm px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:border-stone-400"
          >
            <SearchIcon className="w-3.5 h-3.5" />
            {t('nav.search')}
          </button>
        )}

        {legendOpen ? (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur border border-stone-200 rounded-xl shadow-sm p-2.5 max-w-xs">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{t('network.legend')}</p>
              <button
                onClick={() => setLegendOpen(false)}
                title={t('common.close')}
                className="p-0.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <ChevronIcon dir="down" className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 max-h-36 overflow-y-auto pr-1">
              {Object.entries(TRADITIONS).map(([id, tr]) => (
                <span key={id} className="inline-flex items-center gap-1 text-[10px] text-stone-600 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: mutedColor(id) }} />
                  <span className="truncate">{L({ en: tr.en, zh: tr.zh })}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLegendOpen(true)}
            className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur border border-stone-200 rounded-full shadow-sm px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:border-stone-400"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: mutedColor('greek') }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: mutedColor('norse') }} />
            {t('network.legend')}
          </button>
        )}
      </div>

      <aside className="w-full md:w-96 shrink-0 bg-white border-t md:border-t-0 md:border-l border-stone-200 overflow-y-auto">
        {sel ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: mutedColor(sel.tradition) }} />
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
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">{t('emb.neighbors')}</p>
                <div className="space-y-1">
                  {neighbors.map(({ text: nb, sim }) => (
                    <button
                      key={nb.id}
                      onClick={() => setSelectedId(nb.id)}
                      className="w-full flex items-center gap-2 text-left bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 hover:border-stone-400"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: mutedColor(nb.tradition) }} />
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
                  type: 'text',
                  ref: sel.id,
                  title: L(sel.title),
                  subtitle: `${L(TRADITIONS[sel.tradition] || { en: sel.tradition })} · ${L(sel.region)}`,
                  text: L(sel.summary),
                  meta: { textId: sel.id, motifs: sel.motifs, category: sel.category, from: 'embedding3d' },
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
          <div className="p-5 text-sm text-stone-400">{t('emb.hint')}</div>
        )}
      </aside>
    </div>
  )
}
