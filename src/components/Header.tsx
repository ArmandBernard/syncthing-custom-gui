import { AppMenu } from './AppMenu.tsx'

export function Header() {
  return (
    <header className="flex justify-end p-2 bg-surface-container-highest">
      <AppMenu />
    </header>
  )
}
