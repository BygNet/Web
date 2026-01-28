export interface BygPage {
  title: string
  description: string
  path: string
  icon: string
}

export interface BygPost {
  id: number
  title: string
  content: string
  author: string
  createdDate: string
  likes: number
  shares: number
  commentCount: number
}

export interface BygImage {
  id: number
  title: string
  imageUrl: string
  author: string
  createdDate: string
  likes: number
  shares: number
  commentCount: number
}

export interface BygComment {
  id: number
  author: string
  content: string
  createdDate: string
}

export interface BygShop {
  title: string
  subtitle: string
  imageName: string
  tint: string
  openUrl: string
}
