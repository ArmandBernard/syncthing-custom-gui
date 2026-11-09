import type { TableHTMLAttributes } from 'preact'
import type { PropsWithChildren } from 'react'

// Tailwind only generates classes it can find as complete strings in the source,
// so these must be written out in full rather than assembled at runtime.
const tableClasses = `
  border-collapse text-sm
  [&_th]:border-b [&_th]:border-outline [&_th]:px-2 [&_th]:py-1 [&_th]:text-left
  [&_td]:border-b [&_td]:border-outline [&_td]:px-2 [&_td]:py-1
  `

export function Table({ children, className, ...rest }: PropsWithChildren<TableHTMLAttributes>) {
  const allClasses = [tableClasses, className as string | undefined].join(' ')
  return (
    <table className={allClasses} {...rest}>
      {children}
    </table>
  )
}
