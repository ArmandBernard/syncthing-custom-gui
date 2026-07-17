import { Header } from './views/header/Header.tsx'
import { Dashboard } from './Dashboard.tsx'

import { TransferHistoryContextProvider } from './context/transfer-history/TransferHistoryContextProvider.tsx'
import { ConnectionsContextProvider } from './context/connections/ConnectionsContextProvider.tsx'
import { DeviceIDContextProvider } from './context/device-id/DeviceIDContextProvider.tsx'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-low">
      <Header />

      <main className="flex flex-1 flex-col">
        <DeviceIDContextProvider>
          <ConnectionsContextProvider>
            <TransferHistoryContextProvider>
              <Dashboard />
            </TransferHistoryContextProvider>
          </ConnectionsContextProvider>
        </DeviceIDContextProvider>
      </main>
    </div>
  )
}

export default App
