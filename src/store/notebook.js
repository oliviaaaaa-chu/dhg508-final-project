import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

let counter = 0
const uid = (item) => `${item.type}:${item.ref || item.title}`

export const useNotebook = create(
  persist(
    (set, get) => ({
      items: [],
      has: (item) => get().items.some((i) => i.uid === uid(item)),
      add: (item) => {
        const key = uid(item)
        if (get().items.some((i) => i.uid === key)) return
        counter += 1
        set((s) => ({
          items: [
            {
              ...item,
              uid: key,
              createdAt: new Date().toISOString(),
              note: item.note || '',
            },
            ...s.items,
          ],
        }))
      },
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.uid !== key) })),
      setNote: (key, note) =>
        set((s) => ({ items: s.items.map((i) => (i.uid === key ? { ...i, note } : i)) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'dhg508-notebook',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
