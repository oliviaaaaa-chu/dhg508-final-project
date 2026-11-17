function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function Highlight({ text, terms = [] }) {
  const valid = [...new Set((terms || []).filter((t) => t && t.length > 1))]
  if (!valid.length || !text) return <>{text}</>
  try {
    const splitRe = new RegExp(`(${valid.map(escapeRegex).join('|')})`, 'giu')
    const matchRe = new RegExp(`^(?:${valid.map(escapeRegex).join('|')})$`, 'iu')
    return (
      <>
        {text.split(splitRe).map((part, i) =>
          part && matchRe.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
        )}
      </>
    )
  } catch {
    return <>{text}</>
  }
}

export default Highlight
