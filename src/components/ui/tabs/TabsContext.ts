import { createContext } from 'react'

export interface TabsContextValue {
  idBase: string
  selectedValue: string
  onSelect: (value: string) => void
}

export const TabsContext = createContext<TabsContextValue | null>(null)
