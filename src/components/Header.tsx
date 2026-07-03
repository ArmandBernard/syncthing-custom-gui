import { AppMenu } from './AppMenu.tsx'
import { StatusIndicator } from './StatusIndicator.tsx'

export function Header() {
  return (
    <header className="flex justify-end p-2 gap-2 bg-surface-container-highest">
      <StatusIndicator />
      <AppMenu />
    </header>
  )
}
