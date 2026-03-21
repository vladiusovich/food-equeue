import type { TabsRootProps } from '@skeletonlabs/skeleton-svelte'
import type { Snippet } from 'svelte'

export interface Tab {
  title: string | Snippet
  content: string | Snippet
  value: string
}

export interface TabsProps extends TabsRootProps {
  tabs: Tab[]
}
