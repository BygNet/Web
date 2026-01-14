import type { BygPage } from '@/types/contentTypes.ts'

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
    title: 'Video',
    description: 'Vertical videos.',
    path: '/video',
    icon: 'solar:video-library-line-duotone',
  },
  {
    title: 'Shop',
    description: 'Shopping hub.',
    path: '/shop',
    icon: 'solar:shop-line-duotone',
  },
  {
    title: 'Pro',
    description: 'Upgraded Byg experience.',
    path: '/pro',
    icon: 'solar:stars-line-duotone',
  },
]
