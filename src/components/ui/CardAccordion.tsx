import { AccordionBase, type AccordionProps } from './AccordionBase.tsx'

export function CardAccordion({ expanded, setExpanded, buttonBody, children }: AccordionProps) {
  return (
    <div className="rounded-md bg-surface text-on-surface">
      <AccordionBase
        expanded={expanded}
        setExpanded={setExpanded}
        buttonClassname={
          'p-4 bg-surface hover:brightness-80 rounded-md ' +
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        }
        buttonBody={<div className="flex flex-col">{buttonBody}</div>}
      >
        <div className="pb-4 px-4">{children}</div>
      </AccordionBase>
    </div>
  )
}
