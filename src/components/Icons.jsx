const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function SearchIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 L21 21" />
    </svg>
  )
}

export function CompareIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="16" rx="1" />
      <path d="M10 12 h4" />
    </svg>
  )
}

export function MapIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21c-4-4.5-7-8-7-11.5A7 7 0 0 1 19 9.5C19 13 16 16.5 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

export function NetworkIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="5" cy="7" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="12" cy="13" r="3" />
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18.5" cy="19.5" r="2" />
      <path d="M7 8.5 10 11M14.5 11.5 17.2 7.3M9 17.5l1.2-2M14 15.3l3 3.2M7.5 8.2 16 6.5" />
    </svg>
  )
}

export function NotebookIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path d="M5 4a2 2 0 0 1 2-2h9v2" />
      <path d="M9 9h6M9 13h6" />
    </svg>
  )
}

export function ChatIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 4V6Z" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  )
}

export function SaveIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 5h11l3 3v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5Z" />
      <path d="M8 5v5h7V5M8 19v-5h8v5" />
    </svg>
  )
}

export function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4.5 12.5 10 18 19.5 6.5" />
    </svg>
  )
}

export function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  )
}

export function LibraryIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 4.5h4.5v15H4z" />
      <path d="M10.5 4.5H15v15h-4.5z" />
      <path d="M17.2 5.3l2.3.6-3 13.9-2.3-.6z" />
    </svg>
  )
}

export function EmbeddingIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20V4M4 20h16" />
      <circle cx="10" cy="9" r="2.2" />
      <circle cx="15" cy="12.5" r="2.2" />
      <circle cx="8" cy="14.5" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
    </svg>
  )
}

export function GlobeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 4 5.6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.6-4-9s1.5-6.4 4-9Z" />
    </svg>
  )
}

export function ChevronIcon({ className = 'w-3.5 h-3.5', dir = 'down' }) {
  const rot = { down: 0, up: 180, left: 90, right: -90 }[dir] || 0
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ transform: `rotate(${rot}deg)` }} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
