import { AppMenu } from './AppMenu.tsx'
import { StatusIndicator } from './StatusIndicator.tsx'

export function Header() {
  return (
    <header
      className={`flex justify-between gap-2 p-2
        border-b dark:border-b-none border-outline-variant bg-surface-container-highest shadow-md`}
    >
      <div className="text-xl flex items-center">syncthing-custom-gui</div>
      <div className="flex">
        <StatusIndicator />
        <AppMenu />
      </div>
    </header>
  )
}
