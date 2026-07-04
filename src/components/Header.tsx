import { AppMenu } from './AppMenu.tsx'
import { StatusIndicator } from './StatusIndicator.tsx'

export function Header() {
  return (
    <header className="flex items-center justify-between gap-2 p-2 bg-surface-high shadow-sm">
      <div className="flex items-center gap-2">
        <img alt="" aria-hidden className="h-8 w-8" src="/favicon.svg" />
        <div className="text-xl pb-1">syncthing-custom-gui</div>
      </div>
      <div className="flex gap-2">
        <StatusIndicator />
        <AppMenu />
      </div>
    </header>
  )
}
