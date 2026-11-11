import type { ComponentChildren } from 'preact'
import type { Dispatch, StateUpdater } from 'preact/hooks'
import { useId } from 'preact/hooks'
import type { PropsWithChildren } from 'preact/compat'

export type AccordionProps = PropsWithChildren<{
  expanded: boolean
  setExpanded: Dispatch<StateUpdater<boolean>>
  buttonBody: ComponentChildren
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
