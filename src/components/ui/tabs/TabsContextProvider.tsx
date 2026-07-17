import { type PropsWithChildren, useId } from 'preact/compat'
import { TabsContext } from '@components/ui/tabs/TabsContext.ts'

export function TabsContextProvider({
  children,
  ...rest
}: PropsWithChildren<{ selectedValue: string; onSelect: (value: string) => void }>) {
  const idBase = useId()

  return <TabsContext.Provider value={{ idBase: idBase, ...rest }}>{children}</TabsContext.Provider>
}
