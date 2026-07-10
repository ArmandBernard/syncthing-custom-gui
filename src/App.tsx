import { ApiKeyForm } from './components/ApiKeyForm'
import { useApiKey } from './hooks/useApiKey'
import { Header } from './components/Header.tsx'
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
        <DeviceIDContextProvider>
          <ConnectionsContextProvider>
            <TransferHistoryContextProvider>
              {apiKey ? <Dashboard /> : <ApiKeyForm onSubmit={setApiKey} />}
            </TransferHistoryContextProvider>
          </ConnectionsContextProvider>
        </DeviceIDContextProvider>
      </main>
    </div>
  )
}

export default App
