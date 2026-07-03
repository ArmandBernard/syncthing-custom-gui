import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiKeyProvider } from './hooks/ApiKeyProvider.tsx'
import './styles/index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  // Most queries here are already interval-polled and hit a local Syncthing
  // instance; retrying a failed request just delays surfacing real errors
  // (e.g. a bad API key) to the user for no benefit.
  defaultOptions: { queries: { retry: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiKeyProvider>
        <App />
      </ApiKeyProvider>
    </QueryClientProvider>
  </StrictMode>,
)
