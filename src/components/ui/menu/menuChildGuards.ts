import { type ComponentChildren, isValidElement, type VNode } from 'preact'
import { MenuItem, type MenuItemProps } from './MenuItem.tsx'
import { MenuGroup, type MenuGroupProps } from './MenuGroup.tsx'

export function isMenuItemElement(node: ComponentChildren): node is VNode<MenuItemProps> {
  return isValidElement(node) && (node as VNode).type === MenuItem
}

export function isMenuGroupElement(node: ComponentChildren): node is VNode<MenuGroupProps> {
  return isValidElement(node) && (node as VNode).type === MenuGroup
}
