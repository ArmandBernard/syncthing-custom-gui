import { Header } from './views/header/Header.tsx'
import { TransferHistoryContextProvider } from './context/transfer-history/TransferHistoryContextProvider.tsx'
import { ConnectionsContextProvider } from './context/connections/ConnectionsContextProvider.tsx'
import { DeviceIDContextProvider } from './context/device-id/DeviceIDContextProvider.tsx'
import { lazy } from 'preact/compat'
import { Suspense } from 'react'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'

const Dashboard = lazy(() => import('./Dashboard.tsx'))

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-1 flex-col">
        <DeviceIDContextProvider>
          <ConnectionsContextProvider>
            <TransferHistoryContextProvider>
              <Suspense fallback={<CircularProgressCentred name="dashboard" />}>
                <Dashboard />
              </Suspense>
            </TransferHistoryContextProvider>
          </ConnectionsContextProvider>
        </DeviceIDContextProvider>
      </main>
    </div>
  )
}

export default App
