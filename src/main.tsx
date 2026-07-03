import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiKeyProvider } from './hooks/ApiKeyProvider.tsx'
import { ThemeProvider } from './hooks/ThemeProvider.tsx'
import { SnackbarProvider } from './hooks/SnackbarProvider.tsx'
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
      <ThemeProvider>
        <SnackbarProvider>
          <ApiKeyProvider>
            <App />
          </ApiKeyProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
