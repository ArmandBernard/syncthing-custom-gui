import type { ComponentChildren } from 'preact'

export default function ListItem({
  leftSlot,
  rightSlot,
}: {
  leftSlot: ComponentChildren
  rightSlot: ComponentChildren
}) {
  return (
    <li className="flex justify-between py-0.5">
      <div>{leftSlot}</div>
      <div>{rightSlot}</div>
    </li>
  )
}
