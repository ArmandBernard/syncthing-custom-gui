import { ApiKeyForm } from './views/ApiKeyForm.tsx'
import { useApiKey } from './hooks/useApiKey'
import { Header } from './views/header/Header.tsx'
import { Dashboard } from './Dashboard.tsx'

import { TransferHistoryContextProvider } from './context/transfer-history/TransferHistoryContextProvider.tsx'
import { ConnectionsContextProvider } from './context/connections/ConnectionsContextProvider.tsx'
import { DeviceIDContextProvider } from './context/device-id/DeviceIDContextProvider.tsx'

function App() {
  const { apiKey, setApiKey } = useApiKey()

  return (
    <div className="flex min-h-screen flex-col bg-surface-low">
      <Header />

      <main className="flex flex-1 flex-col">
        {apiKey ? (
          <DeviceIDContextProvider>
            <ConnectionsContextProvider>
              <TransferHistoryContextProvider>
                <Dashboard />
              </TransferHistoryContextProvider>
            </ConnectionsContextProvider>
          </DeviceIDContextProvider>
        ) : (
          <ApiKeyForm onSubmit={setApiKey} />
        )}
      </main>
    </div>
  )
}

export default App
