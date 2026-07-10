import { ApiKeyForm } from './components/ApiKeyForm'
import { useApiKey } from './hooks/useApiKey'
import { Header } from './components/Header.tsx'
import { Dashboard } from './Dashboard.tsx'
import { ConnectionsContextProvider } from './lib/ConnectionsContext.tsx'
import { DeviceIDContextProvider } from './lib/DeviceIdContext.tsx'

function App() {
  const { apiKey, setApiKey } = useApiKey()

  return (
    <div className="flex min-h-screen flex-col bg-surface-low">
      <Header />

      <main className="flex flex-1 flex-col">
        <DeviceIDContextProvider>
          <ConnectionsContextProvider>
            {apiKey ? <Dashboard /> : <ApiKeyForm onSubmit={setApiKey} />}
          </ConnectionsContextProvider>
        </DeviceIDContextProvider>
      </main>
    </div>
  )
}

export default App
