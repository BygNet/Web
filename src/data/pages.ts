import type { BygPage } from '@bygnet/types'

export const BygPages: BygPage[] = [
  {
    title: 'Social',
    description: 'Text posts.',
    path: '/',
    icon: 'solar:posts-carousel-vertical-line-duotone',
  },
  {
    title: 'Picture',
    description: 'Image uploads.',
    path: '/picture',
    icon: 'solar:gallery-wide-line-duotone',
  },
  {
    title: 'Link',
    description: 'User-generated link collections.',
    path: '/link',
    icon: 'solar:link-minimalistic-2-line-duotone',
  },
  {
    title: 'Shop',
    description: 'Shopping hub.',
    path: '/shop',
    icon: 'solar:shop-line-duotone',
  },
  {
    title: 'Profile',
    description: 'Your Byg Account.',
    path: '/me',
    icon: 'solar:user-line-duotone',
  },
]
