import {
  type Dispatch,
  type PropsWithChildren,
  type ReactNode,
  type SetStateAction,
  useId,
} from 'react'

export type AccordionProps = PropsWithChildren<{
  expanded: boolean
  setExpanded: Dispatch<SetStateAction<boolean>>
  buttonBody: ReactNode
  buttonClassname?: string
}>

export function AccordionBase({
  children,
  expanded,
  setExpanded,
  buttonBody,
  buttonClassname,
}: AccordionProps) {
  const sectionId = useId()

  return (
    <div className="flex flex-col">
      <button
        className={'cursor-pointer ' + buttonClassname}
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
