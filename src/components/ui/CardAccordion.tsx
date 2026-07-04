import { AccordionBase, type AccordionProps } from './AccordionBase.tsx'

export function CardAccordion({ expanded, setExpanded, buttonBody, children }: AccordionProps) {
  return (
    <div className="rounded-md bg-surface text-on-surface">
      <AccordionBase
        expanded={expanded}
        setExpanded={setExpanded}
        buttonBody={
          <div className="p-4 bg-surface rounded-md hover:brightness-80 flex flex-col">
            {buttonBody}
          </div>
        }
      >
        <div className="pb-4 px-4">{children}</div>
      </AccordionBase>
    </div>
  )
}
