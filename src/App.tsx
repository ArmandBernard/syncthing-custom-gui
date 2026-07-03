import { ApiKeyForm } from './components/ApiKeyForm'
import { StatusIndicator } from './components/StatusIndicator'
import { useApiKey } from './hooks/useApiKey'
import { useServerStatus } from './hooks/useServerStatus'

function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const status = useServerStatus(apiKey)

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      {apiKey ? (
        <StatusIndicator status={status} onChangeKey={clearApiKey} />
      ) : (
        <ApiKeyForm onSubmit={setApiKey} />
      )}
    </div>
  )
}

export default App
