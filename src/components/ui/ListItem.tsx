import type { ReactNode } from 'react'

export default function ListItem({
  leftSlot,
  rightSlot,
}: {
  leftSlot: ReactNode
  rightSlot: ReactNode
}) {
  return (
    <li className="flex justify-between py-0.5">
      <div>{leftSlot}</div>
      <div>{rightSlot}</div>
    </li>
  )
}
