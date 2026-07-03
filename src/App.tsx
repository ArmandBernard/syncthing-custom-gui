import { ApiKeyForm } from './components/ApiKeyForm'
import { StatusIndicator } from './components/StatusIndicator'
import { useApiKey } from './hooks/useApiKey'

function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex flex-col">
      {apiKey ? <StatusIndicator onChangeKey={clearApiKey} /> : <ApiKeyForm onSubmit={setApiKey} />}
    </div>
  )
}

export default App
