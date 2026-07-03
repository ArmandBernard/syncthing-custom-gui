import { ApiKeyForm } from './components/ApiKeyForm'
import { AppMenu } from './components/AppMenu'
import { StatusIndicator } from './components/StatusIndicator'
import { useApiKey } from './hooks/useApiKey'

function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()

  return (
    <div className="flex min-h-screen flex-col bg-surface px-4">
      <div className="flex justify-end pt-4">
        <AppMenu />
      </div>
      {apiKey ? <StatusIndicator onChangeKey={clearApiKey} /> : <ApiKeyForm onSubmit={setApiKey} />}
    </div>
  )
}

export default App
