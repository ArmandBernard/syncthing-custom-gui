import { type ReactNode } from 'react'

export function Identicon({
  id,
  size = 5,
  className,
}: {
  id: string
  size?: number
  className?: string
}) {
  let middleCol = Math.ceil(size / 2) - 1
  let rectSize = 100 / size

  function shouldFillRectAt(value: string, row: number, col: number) {
    return !(value.charCodeAt(row + col * size) % 2)
  }
  function shouldMirrorRectAt(col: number) {
    return !(size % 2 && col === middleCol)
  }
  function mirrorColFor(col: number) {
    return size - col - 1
  }
  function rectAt(row: number, col: number) {
    return (
      <rect
        x={col * rectSize + '%'}
        y={row * rectSize + '%'}
        width={rectSize + '%'}
        height={rectSize + '%'}
      />
    )
  }

  const children: ReactNode[] = []

  if (id) {
    const onlyNumbersAndLetters = id.toString().replace(/[\W_]/g, '')
    let row: number
    let col: number
    for (row = 0; row < size; ++row) {
      for (col = middleCol; col > -1; --col) {
        if (shouldFillRectAt(onlyNumbersAndLetters, row, col)) {
          children.push(rectAt(row, col))

          if (shouldMirrorRectAt(col)) {
            children.push(rectAt(row, mirrorColFor(col)))
          }
        }
      }
    }
  }

  return <svg className={className ?? 'h-5 w-5 fill-on-surface'}>{children}</svg>
}
