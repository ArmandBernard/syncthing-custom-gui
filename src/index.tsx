import { render } from 'preact'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/AuthProvider.tsx'
import { ThemeProvider } from './hooks/ThemeProvider.tsx'
import { SnackbarProvider } from './hooks/SnackbarProvider.tsx'
import './styles/index.css'
import App from './App.tsx'
import { InvalidationLayer } from './InvalidationLayer.tsx'

const queryClient = new QueryClient({
  // Most queries here are already interval-polled and hit a local Syncthing
  // instance; retrying a failed request just delays surfacing real errors
  // (e.g. a bad API key) to the user for no benefit.
  defaultOptions: { queries: { retry: false } },
})

render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SnackbarProvider>
        <AuthProvider>
          <InvalidationLayer>
            <App />
          </InvalidationLayer>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </QueryClientProvider>,
  document.getElementById('root')!,
)
