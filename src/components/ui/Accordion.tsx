import {
  type Dispatch,
  type PropsWithChildren,
  type ReactNode,
  type SetStateAction,
  useId,
} from 'react'

export function Accordion({
  children,
  expanded,
  setExpanded,
  buttonBody,
}: PropsWithChildren<{
  expanded: boolean
  setExpanded: Dispatch<SetStateAction<boolean>>
  buttonBody: ReactNode
}>) {
  const sectionId = useId()

  return (
    <div className="flex flex-col">
      <button
        aria-controls={sectionId}
        aria-expanded={expanded}
        onClick={() => setExpanded((old) => !old)}
      >
        {buttonBody}
      </button>
      <div id={sectionId} aria-expanded={expanded} hidden={!expanded}>
        {expanded && children}
      </div>
    </div>
  )
}
