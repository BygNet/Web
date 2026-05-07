export interface BygPageMeta {
  key: string
  titleKey: string
  descriptionKey: string
  path: string
  icon: string
  color?: string
}

export const SpacerPage: BygPageMeta = {
  key: 'spacer',
  titleKey: '',
  descriptionKey: '',
  path: '',
  icon: '',
}

export const CreatePage: BygPageMeta = {
  key: 'create',
  titleKey: 'common.createEllipsis',
  descriptionKey: 'pages.create.description',
  path: '#create',
  icon: 'solar:pen-line-duotone',
  color: '#3a986d',
}

export const SocialPage: BygPageMeta = {
  key: 'social',
  titleKey: 'pages.social.title',
  descriptionKey: 'pages.social.description',
  path: '/',
  icon: 'solar:home-angle-line-duotone',
  color: '#d136b9',
}

export const PicturePage: BygPageMeta = {
  key: 'picture',
  titleKey: 'pages.picture.title',
  descriptionKey: 'pages.picture.description',
  path: '/picture',
  icon: 'solar:gallery-wide-line-duotone',
  color: '#9163e9',
}

export const MessagesPage: BygPageMeta = {
  key: 'messages',
  titleKey: 'pages.messages.title',
  descriptionKey: 'pages.messages.description',
  path: '/messages',
  icon: 'solar:plain-line-duotone',
  color: '#4091a0',
}

export const MySpacePage: BygPageMeta = {
  key: 'my-space',
  titleKey: 'pages.mySpace.title',
  descriptionKey: 'pages.mySpace.description',
  path: '/my-space',
  icon: 'solar:user-line-duotone',
  color: '#3a986d',
}

export const BygPages: BygPageMeta[] = [
  SocialPage,
  PicturePage,
  MessagesPage,
  MySpacePage,
]

export const SearchPage: BygPageMeta = {
  key: 'search',
  titleKey: 'pages.search.title',
  descriptionKey: 'pages.search.description',
  path: '/search',
  icon: 'solar:minimalistic-magnifer-line-duotone',
  color: '#a77c20',
}

export const InboxPage: BygPageMeta = {
  key: 'inbox',
  titleKey: 'pages.inbox.title',
  descriptionKey: 'pages.inbox.description',
  path: '/inbox',
  icon: 'solar:inbox-line-line-duotone',
  color: '#e0803c',
}

export const LinkPage: BygPageMeta = {
  key: 'link',
  titleKey: 'pages.link.title',
  descriptionKey: 'pages.link.description',
  path: '/link',
  icon: 'solar:link-minimalistic-2-line-duotone',
  color: '#e03c72',
}

export const VerificationPage: BygPageMeta = {
  key: 'verification',
  titleKey: 'pages.verification.title',
  descriptionKey: 'pages.verification.description',
  path: '/verification',
  icon: 'solar:verified-check-line-duotone',
  color: '#aa89e9',
}

export const SettingsPage: BygPageMeta = {
  key: 'settings',
  titleKey: 'pages.settings.title',
  descriptionKey: 'pages.settings.description',
  path: '/settings',
  icon: 'solar:settings-minimalistic-line-duotone',
  color: '#3e3255',
}

export const CreditsPage: BygPageMeta = {
  key: 'credits',
  titleKey: 'pages.credits.title',
  descriptionKey: 'pages.credits.description',
  path: '/credits',
  icon: 'solar:hand-heart-line-duotone',
  color: '#bfb26f',
}

export const MorePages: BygPageMeta[] = [
  SearchPage,
  InboxPage,
  LinkPage,
  VerificationPage,
  SettingsPage,
  CreditsPage,
]

export const ExplorePage: BygPageMeta = {
  key: 'explore',
  titleKey: 'pages.explore.title',
  descriptionKey: 'pages.explore.description',
  path: '/explore',
  icon: 'solar:widget-5-line-duotone',
  color: '#9373e1',
}

export const LoginPage: BygPageMeta = {
  key: 'login',
  titleKey: 'pages.login.title',
  descriptionKey: 'pages.login.description',
  path: '/login',
  icon: 'solar:login-2-line-duotone',
}

export const SignupPage: BygPageMeta = {
  key: 'signup',
  titleKey: 'pages.signup.title',
  descriptionKey: 'pages.signup.description',
  path: '/signup',
  icon: 'solar:user-plus-rounded-line-duotone',
}

export const TermsPage: BygPageMeta = {
  key: 'terms',
  titleKey: 'pages.terms.title',
  descriptionKey: 'pages.terms.description',
  path: '/terms',
  icon: 'solar:document-add-line-duotone',
}

export const ProPage: BygPageMeta = {
  key: 'pro',
  titleKey: 'pages.pro.title',
  descriptionKey: 'pages.pro.description',
  path: '/pro',
  icon: 'solar:crown-star-line-duotone',
}

export const TabPage: BygPageMeta = {
  key: 'tab',
  titleKey: 'pages.tab.title',
  descriptionKey: 'pages.tab.description',
  path: '/tab',
  icon: 'solar:add-circle-line-duotone',
}

export const EmailVerificationPage: BygPageMeta = {
  key: 'email-verification',
  titleKey: 'pages.emailVerification.title',
  descriptionKey: 'pages.emailVerification.description',
  path: '/email-verification',
  icon: 'solar:letter-line-duotone',
}

export const ExtraPages: BygPageMeta[] = [
  LoginPage,
  SignupPage,
  TermsPage,
  ProPage,
  TabPage,
  EmailVerificationPage,
]

export const AllPages: BygPageMeta[] = [
  ...BygPages,
  ...MorePages,
  ExplorePage,
  ...ExtraPages,
]

export const DesktopPages: BygPageMeta[] = [
  SocialPage,
  PicturePage,
  CreatePage,
  SpacerPage,

  MessagesPage,
  MySpacePage,
  SettingsPage,
  SpacerPage,

  ExplorePage,
]

export const PageMetaByPath = AllPages.reduce<Record<string, BygPageMeta>>(
  (acc, page) => {
    acc[page.path] = page
    return acc
  },
  {}
)
