import { AppMenu } from './AppMenu.tsx'
import { StatusIndicator } from './StatusIndicator.tsx'

export function Header() {
  return (
    <header className="flex justify-between gap-2 p-2 bg-surface-high shadow-sm">
      <div className="text-xl flex items-center">syncthing-custom-gui</div>
      <div className="flex gap-2">
        <StatusIndicator />
        <AppMenu />
      </div>
    </header>
  )
}
