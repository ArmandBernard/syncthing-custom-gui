import { CircularProgress } from './ui/Progress.tsx'
import { useId } from 'react'

export function CircularProgressCentred({ name }: { name: string }) {
  const labelId = useId()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <CircularProgress aria-labelledby={labelId} />
      <div id={labelId}>Loading {name}...</div>
    </div>
  )
}
