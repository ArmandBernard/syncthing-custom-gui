import { ApiKeyForm } from './components/ApiKeyForm'
import { useApiKey } from './hooks/useApiKey'
import { Header } from './components/Header.tsx'
import { Dashboard } from './Dashboard.tsx'
import { ConnectionsContextProvider } from './lib/ConnectionsContext.tsx'

function App() {
  const { apiKey, setApiKey } = useApiKey()

  return (
    <div className="flex min-h-screen flex-col bg-surface-low">
      <Header />

      <main className="flex flex-1 flex-col">
        <ConnectionsContextProvider>
          {apiKey ? <Dashboard /> : <ApiKeyForm onSubmit={setApiKey} />}
        </ConnectionsContextProvider>
      </main>
    </div>
  )
}

export default App
