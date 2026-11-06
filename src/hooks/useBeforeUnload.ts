import { useEffect } from 'react'

export function useBeforeUnload(callback: () => void): void {
  useEffect(() => {
    function handleBeforeUnload() {
      callback()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [callback])
}
