import type { BygPage } from '@bygnet/types'

export const BygPages: BygPage[] = [
  {
    title: 'Social',
    description: 'Text posts.',
    path: '/',
    icon: 'solar:posts-carousel-vertical-line-duotone',
    color: '#d136b9',
  },
  {
    title: 'Picture',
    description: 'Image uploads.',
    path: '/picture',
    icon: 'solar:gallery-wide-line-duotone',
    color: '#9163e9',
  },
  {
    title: 'Chat',
    description: 'Direct messages.',
    path: '/messages',
    icon: 'solar:chat-round-like-line-duotone',
    color: '#4091a0',
  },
  {
    title: 'Profile',
    description: 'Online profile.',
    path: '/me',
    icon: 'solar:user-line-duotone',
    color: '#3a986d',
  },
]

export const MorePages: BygPage[] = [
  {
    title: 'Search',
    description: 'Private web search.',
    path: '/search',
    icon: 'solar:minimalistic-magnifer-line-duotone',
    color: '#a77c20',
  },
  {
    title: 'Link',
    description: 'Link collections.',
    path: '/link',
    icon: 'solar:link-minimalistic-2-line-duotone',
    color: '#e03c72',
  },
]
