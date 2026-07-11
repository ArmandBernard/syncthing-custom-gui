import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { MenuItem, type MenuItemProps } from './MenuItem.tsx'
import { MenuGroup, type MenuGroupProps } from './MenuGroup.tsx'

export function isMenuItemElement(node: ReactNode): node is ReactElement<MenuItemProps> {
  return isValidElement(node) && (node as ReactElement).type === MenuItem
}

export function isMenuGroupElement(node: ReactNode): node is ReactElement<MenuGroupProps> {
  return isValidElement(node) && (node as ReactElement).type === MenuGroup
}
