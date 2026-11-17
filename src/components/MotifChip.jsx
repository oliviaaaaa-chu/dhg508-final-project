import { useI18n } from '../i18n/index.jsx'

export default function MotifChip({ motif, onClick }) {
  const { L } = useI18n()
  if (!motif) return null
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-baseline gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full px-2.5 py-0.5 text-xs hover:bg-amber-100 transition-colors ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      title={motif.code}
    >
      <span className="font-medium">{L(motif.name)}</span>
      <span className="text-amber-600/70 text-[10px]">{motif.code}</span>
    </button>
  )
}
