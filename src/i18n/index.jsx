import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.js'
import zhTW from './zh-TW.js'

const DICTS = { en, 'zh-TW': zhTW }
const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang] = useState('en')
  const setLang = () => {}

  useEffect(() => {
    localStorage.removeItem('dhg508-lang')
    document.documentElement.lang = 'en'
  }, [])

  const value = useMemo(() => {
    const t = (key, vars) => {
      let s = DICTS[lang]?.[key] ?? DICTS.en[key] ?? key
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
      return s
    }
    const L = (field) => {
      if (field == null) return ''
      if (typeof field === 'string') return field
      return field[lang] ?? field.en ?? ''
    }
    return { lang, setLang, t, L }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
