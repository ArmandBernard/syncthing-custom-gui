import { ApiKeyForm } from './components/ApiKeyForm'
import { useApiKey } from './hooks/useApiKey'
import { Header } from './components/Header.tsx'
import { Dashboard } from './Dashboard.tsx'

function App() {
  const { apiKey, setApiKey } = useApiKey()

  return (
    <div className="flex min-h-screen flex-col bg-surface-low">
      <Header />

      <main className="flex flex-1 flex-col">
        {apiKey ? <Dashboard /> : <ApiKeyForm onSubmit={setApiKey} />}
      </main>
    </div>
  )
}

export default App
