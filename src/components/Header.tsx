import { AppMenu } from './AppMenu.tsx'
import { StatusIndicator } from './StatusIndicator.tsx'

export function Header() {
  return (
    <header className="flex justify-between p-2 gap-2 bg-surface-container-highest">
      <div className="text-xl flex items-center">syncthing-custom-gui</div>
      <div className="flex">
        <StatusIndicator />
        <AppMenu />
      </div>
    </header>
  )
}
