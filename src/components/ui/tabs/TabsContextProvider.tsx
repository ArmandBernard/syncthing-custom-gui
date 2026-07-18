import { type PropsWithChildren, useId } from 'preact/compat'
import { TabsContext } from '@components/ui/tabs/TabsContext.ts'

export function TabsContextProvider<T extends string>({
  children,
  selectedValue,
  onSelect,
}: PropsWithChildren<{ selectedValue: T; onSelect: (value: T) => void }>) {
  const idBase = useId()

  return (
    <TabsContext.Provider
      value={{
        idBase: idBase,
        selectedValue: selectedValue,
        onSelect: (value) => onSelect(value as T),
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}
