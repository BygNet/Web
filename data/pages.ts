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
    path: '/my-space',
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
    title: 'Inbox',
    description: 'Your Byg alerts.',
    path: '/inbox',
    icon: 'solar:inbox-line-line-duotone',
    color: '#e0803c',
  },
  {
    title: 'Link',
    description: 'Link collections.',
    path: '/link',
    icon: 'solar:link-minimalistic-2-line-duotone',
    color: '#e03c72',
  },
  {
    title: 'Verification',
    description: 'Get your verified checkmark!',
    path: '/verification',
    icon: 'solar:verified-check-line-duotone',
    color: '#aa89e9',
  },
  {
    title: 'Settings',
    description: 'Account settings.',
    path: '/settings',
    icon: 'solar:settings-minimalistic-line-duotone',
    color: '#3e3255',
  },
  {
    title: 'Credits',
    description: 'Credits for Byg.',
    path: '/credits',
    icon: 'solar:hand-heart-line-duotone',
    color: '#bfb26f',
  },
]

export const ExplorePage: BygPage = {
  title: 'Explore',
  description: 'All Byg apps and more.',
  path: '/explore',
  icon: 'solar:compass-line-duotone',
  color: '#9373e1',
}
