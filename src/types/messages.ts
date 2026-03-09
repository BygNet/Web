import type { BygSubscription } from '@bygnet/types'

export interface BygMessageSharedPost {
  id: number
  title: string
  content: string
  author: string
  createdDate: string
}

export interface BygMessageSharedImage {
  id: number
  title: string
  imageUrl: string
  author: string
  createdDate: string
}

export interface BygMessage {
  id: number
  senderId: number
  senderUsername: string
  senderAvatarUrl: string | null
  senderSubscriptionState: BygSubscription
  recipientId: number
  recipientUsername: string
  recipientAvatarUrl: string | null
  recipientSubscriptionState: BygSubscription
  content: string
  createdDate: string
  sharedPost: BygMessageSharedPost | null
  sharedImage: BygMessageSharedImage | null
}

export interface BygMessageThread {
  userId: number
  username: string
  avatarUrl: string | null
  subscriptionState: BygSubscription
  lastMessagePreview: string
  lastMessageDate: string
}

export interface BygMessageConversation {
  userId: number
  username: string
  avatarUrl: string | null
  subscriptionState: BygSubscription
  messages: BygMessage[]
}

export interface BygMessageShareTarget {
  userId: number
  username: string
  avatarUrl: string | null
  subscriptionState: BygSubscription
  source: 'recent' | 'following'
}

export interface BygMessageSendRequest {
  recipientId: number
  content?: string
  sharedPostId?: number
  sharedImageId?: number
}

export interface BygShareableContent {
  type: 'post' | 'image'
  id: number
  title: string
  author: string
  content?: string
  imageUrl?: string
  shareApiPath: string
}

export interface BygShareModalRequest {
  item: BygShareableContent
  onShared?: () => void
}

export type BygMessageLiveClientEvent =
  | {
      type: 'auth'
      token: string
    }
  | {
      type: 'typing'
      toUserId: number
      isTyping: boolean
    }

export type BygMessageLiveServerEvent =
  | {
      type: 'auth:required'
    }
  | {
      type: 'auth:ok'
      userId: number
      username: string
    }
  | {
      type: 'auth:error'
    }
  | {
      type: 'error'
      reason: string
    }
  | {
      type: 'typing'
      fromUserId: number
      fromUsername: string
      isTyping: boolean
    }
  | {
      type: 'message:new'
      message: BygMessage
    }
