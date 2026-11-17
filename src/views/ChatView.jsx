import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { CHARACTERS, TRADITION_ORDER, characterById, replyLive } from '../lib/mockChat.js'
import { TRADITIONS, tradColor } from '../lib/colors.js'
import SaveButton from '../components/SaveButton.jsx'

export default function ChatView({ onOpen }) {
  const { t, L } = useI18n()
  const [characterId, setCharacterId] = useState('odin')
  const [mode, setMode] = useState('scholarly')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  const character = characterById(characterId)

  useEffect(() => {
    setMessages([])
  }, [characterId, mode])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return
    setInput('')
    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.text }))
    setMessages((m) => [...m, { role: 'user', text }])
    setTyping(true)
    try {
      const r = await replyLive(characterId, mode, text, L, history)
      setMessages((m) => [...m, { role: 'assistant', ...r }])
    } finally {
      setTyping(false)
    }
  }

  const confColor = { high: 'bg-emerald-100 text-emerald-800', medium: 'bg-amber-100 text-amber-800', low: 'bg-stone-200 text-stone-600' }

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return [1, 2, 3].map((tier) => {
      const traditions = TRADITION_ORDER.filter((tr) => tr.tier === tier)
        .map((tr) => ({
          ...tr,
          characters: CHARACTERS.filter((c) => {
            if (c.tradition !== tr.slug) return false
            if (!q) return true
            const trad = TRADITIONS[tr.slug]
            const hay = [c.name.en, c.name.zh, c.role.en, c.role.zh, trad?.en || '', trad?.zh || '']
              .join(' ')
              .toLowerCase()
            return hay.includes(q)
          }),
        }))
        .filter((tr) => tr.characters.length > 0)
      return { tier, traditions }
    }).filter((g) => g.traditions.length > 0)
  }, [filter])

  return (
    <div className="h-full flex flex-col">
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-full px-2 py-0.5 shrink-0">
          {t('chat.fiction')}
        </span>
        <p className="text-xs text-amber-900 leading-snug">{t('chat.disclaimer')}</p>
      </div>

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-6 py-5">
          {/* compact character bar */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => { setPickerOpen(true); setFilter('') }}
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-white pl-2 pr-3 py-1.5 hover:border-stone-400 transition-colors"
              title={character ? L(character.blurb) : ''}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tradColor(character.tradition) }} />
              <span className="font-display font-semibold text-stone-800 text-sm">{L(character.name)}</span>
              <span className="text-[11px] text-stone-400 hidden sm:inline">{L(character.role)}</span>
              <span className="text-[10px] text-stone-400 border-l border-stone-200 pl-2">{t('chat.change')}</span>
            </button>
            <div className="flex rounded-full border border-stone-200 overflow-hidden ml-auto shrink-0">
              {['scholarly', 'dramatic'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  title={t(m === 'scholarly' ? 'chat.modeDesc.scholarly' : 'chat.modeDesc.dramatic')}
                  className={`text-xs px-3.5 py-1.5 transition-colors ${
                    mode === m ? 'bg-stone-900 text-amber-50' : 'bg-white text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {t(m === 'scholarly' ? 'chat.mode.scholarly' : 'chat.mode.dramatic')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-10">{t('chat.placeholder')}</p>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="bg-stone-900 text-amber-50 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%] text-sm leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex flex-col items-start gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">
                      {L(character.name)} · {t(mode === 'scholarly' ? 'chat.mode.scholarly' : 'chat.mode.dramatic')}
                    </span>
                    {mode === 'scholarly' && (
                      <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${confColor[m.confidence]}`}>
                        {t('chat.confidence')}: {t(`chat.confidence.${m.confidence}`)}
                      </span>
                    )}
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] text-sm leading-relaxed text-stone-700">
                    {m.text}
                    {m.source !== 'live' && (
                      <p className="text-[10px] text-stone-300 mt-2 italic">{t('chat.mockNote')}</p>
                    )}
                  </div>
                  {m.citations?.length > 0 && (
                    <div className="w-full max-w-[85%] space-y-1.5 mt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{t('chat.sources')}</p>
                      {m.citations.map((c) => (
                        <div
                          key={c.textId}
                          onClick={() => onOpen?.(c.textId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && onOpen?.(c.textId)}
                          className="bg-stone-50 border border-stone-200 rounded-lg p-3 cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
                          title={t('common.openDetails')}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tradColor(c.tradition) }} />
                            <span className="text-xs font-semibold text-stone-700 group-hover:underline">{c.title}</span>
                            <span className="text-[10px] text-stone-400">{c.region}</span>
                            <span className="ml-auto text-[10px] text-stone-400 shrink-0 hidden sm:inline">{t('common.openDetails')} →</span>
                          </div>
                          <p className="text-xs text-stone-500 font-serif leading-relaxed mt-1.5 line-clamp-2">“{c.quote}”</p>
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <SaveButton
                              item={{
                                type: 'chat',
                                ref: `${characterId}:${c.textId}`,
                                title: `${L(character.name)} → ${c.title}`,
                                subtitle: c.region,
                                text: c.quote,
                                meta: { textId: c.textId, character: characterId, mode },
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            {typing && (
              <div className="flex items-center gap-1.5 text-stone-400 text-sm pl-1">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* character picker overlay */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/30 flex items-start justify-center px-4 pt-[6vh]"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-stone-100">
              <input
                autoFocus
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t('chat.filter')}
                className="flex-1 bg-stone-50 border border-stone-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <span className="text-[11px] text-stone-400 whitespace-nowrap">{CHARACTERS.length} {t('chat.voices')}</span>
              <button onClick={() => setPickerOpen(false)} className="text-stone-400 hover:text-stone-700 text-lg leading-none px-1">×</button>
            </div>
            <div className="overflow-y-auto px-4 py-3">
              {groups.length === 0 && <p className="text-sm text-stone-400 py-4">{t('chat.noMatch')}</p>}
              {groups.map((g) => (
                <div key={g.tier} className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 pt-1.5 pb-1.5">
                    {t(`chat.tier.${g.tier}`)}
                  </p>
                  <div className="space-y-2.5">
                    {g.traditions.map((tr) => (
                      <div key={tr.slug}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tradColor(tr.slug) }} />
                          <span className="text-[11px] font-semibold text-stone-500">
                            {L({ en: TRADITIONS[tr.slug]?.en || tr.slug, zh: TRADITIONS[tr.slug]?.zh || tr.slug })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {tr.characters.map((c) => (
                            <button
                              key={c.id}
                              title={L(c.role)}
                              onClick={() => { setCharacterId(c.id); setPickerOpen(false) }}
                              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                characterId === c.id
                                  ? 'border-amber-500 bg-amber-50 text-stone-900 ring-1 ring-amber-200'
                                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
                              }`}
                            >
                              {L(c.name)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-stone-200 bg-white px-6 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={t('chat.placeholder')}
            className="flex-1 bg-stone-50 border border-stone-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <button
            onClick={send}
            disabled={typing || !input.trim()}
            className="bg-stone-900 text-amber-50 rounded-full px-5 py-2.5 text-sm font-medium hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('nav.chat')}
          </button>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="text-xs text-stone-400 hover:text-stone-700 px-2">
              {t('chat.reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
