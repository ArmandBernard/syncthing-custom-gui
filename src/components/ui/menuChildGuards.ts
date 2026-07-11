import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { MenuItem, type MenuItemProps } from './MenuItem.tsx'
import { MenuToggle, type MenuToggleProps } from './MenuToggle.tsx'

export function isMenuItemElement(node: ReactNode): node is ReactElement<MenuItemProps> {
  return isValidElement(node) && (node as ReactElement).type === MenuItem
}

export function isMenuToggleElement(node: ReactNode): node is ReactElement<MenuToggleProps> {
  return isValidElement(node) && (node as ReactElement).type === MenuToggle
}
