export interface BygPageMeta {
  key: string
  titleKey: string
  descriptionKey: string
  path: string
  icon: string
  color?: string
}

export const BygPages: BygPageMeta[] = [
  {
    key: 'social',
    titleKey: 'pages.social.title',
    descriptionKey: 'pages.social.description',
    path: '/',
    icon: 'solar:posts-carousel-vertical-line-duotone',
    color: '#d136b9',
  },
  {
    key: 'picture',
    titleKey: 'pages.picture.title',
    descriptionKey: 'pages.picture.description',
    path: '/picture',
    icon: 'solar:gallery-wide-line-duotone',
    color: '#9163e9',
  },
  {
    key: 'messages',
    titleKey: 'pages.messages.title',
    descriptionKey: 'pages.messages.description',
    path: '/messages',
    icon: 'solar:chat-round-like-line-duotone',
    color: '#4091a0',
  },
  {
    key: 'my-space',
    titleKey: 'pages.mySpace.title',
    descriptionKey: 'pages.mySpace.description',
    path: '/my-space',
    icon: 'solar:user-line-duotone',
    color: '#3a986d',
  },
]

export const MorePages: BygPageMeta[] = [
  {
    key: 'search',
    titleKey: 'pages.search.title',
    descriptionKey: 'pages.search.description',
    path: '/search',
    icon: 'solar:minimalistic-magnifer-line-duotone',
    color: '#a77c20',
  },
  {
    key: 'inbox',
    titleKey: 'pages.inbox.title',
    descriptionKey: 'pages.inbox.description',
    path: '/inbox',
    icon: 'solar:inbox-line-line-duotone',
    color: '#e0803c',
  },
  {
    key: 'link',
    titleKey: 'pages.link.title',
    descriptionKey: 'pages.link.description',
    path: '/link',
    icon: 'solar:link-minimalistic-2-line-duotone',
    color: '#e03c72',
  },
  {
    key: 'verification',
    titleKey: 'pages.verification.title',
    descriptionKey: 'pages.verification.description',
    path: '/verification',
    icon: 'solar:verified-check-line-duotone',
    color: '#aa89e9',
  },
  {
    key: 'settings',
    titleKey: 'pages.settings.title',
    descriptionKey: 'pages.settings.description',
    path: '/settings',
    icon: 'solar:settings-minimalistic-line-duotone',
    color: '#3e3255',
  },
  {
    key: 'credits',
    titleKey: 'pages.credits.title',
    descriptionKey: 'pages.credits.description',
    path: '/credits',
    icon: 'solar:hand-heart-line-duotone',
    color: '#bfb26f',
  },
]

export const ExplorePage: BygPageMeta = {
  key: 'explore',
  titleKey: 'pages.explore.title',
  descriptionKey: 'pages.explore.description',
  path: '/explore',
  icon: 'solar:compass-line-duotone',
  color: '#9373e1',
}

export const ExtraPages: BygPageMeta[] = [
  {
    key: 'login',
    titleKey: 'pages.login.title',
    descriptionKey: 'pages.login.description',
    path: '/login',
    icon: 'solar:login-2-line-duotone',
  },
  {
    key: 'signup',
    titleKey: 'pages.signup.title',
    descriptionKey: 'pages.signup.description',
    path: '/signup',
    icon: 'solar:user-plus-rounded-line-duotone',
  },
  {
    key: 'terms',
    titleKey: 'pages.terms.title',
    descriptionKey: 'pages.terms.description',
    path: '/terms',
    icon: 'solar:document-add-line-duotone',
  },
  {
    key: 'pro',
    titleKey: 'pages.pro.title',
    descriptionKey: 'pages.pro.description',
    path: '/pro',
    icon: 'solar:crown-star-line-duotone',
  },
  {
    key: 'tab',
    titleKey: 'pages.tab.title',
    descriptionKey: 'pages.tab.description',
    path: '/tab',
    icon: 'solar:add-circle-line-duotone',
  },
  {
    key: 'email-verification',
    titleKey: 'pages.emailVerification.title',
    descriptionKey: 'pages.emailVerification.description',
    path: '/email-verification',
    icon: 'solar:letter-line-duotone',
  },
]

export const AllPages: BygPageMeta[] = [
  ...BygPages,
  ...MorePages,
  ExplorePage,
  ...ExtraPages,
]

export const PageMetaByPath = AllPages.reduce<Record<string, BygPageMeta>>(
  (acc, page) => {
    acc[page.path] = page
    return acc
  },
  {}
)
