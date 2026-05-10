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
  conversationId: number
  senderId: number
  senderUsername: string
  senderAvatarUrl: string | null
  senderSubscriptionState: BygSubscription
  recipientId: number | null
  recipientUsername: string
  recipientAvatarUrl: string | null
  recipientSubscriptionState: BygSubscription
  content: string
  createdDate: string
  sharedPost: BygMessageSharedPost | null
  sharedImage: BygMessageSharedImage | null
}

export interface BygMessageConversationMember {
  userId: number
  username: string
  avatarUrl: string | null
  subscriptionState: BygSubscription
  isCreator: boolean
  joinedDate: string
}

export interface BygMessageThread {
  conversationId: number
  type: 'direct' | 'group'
  name: string | null
  title: string | null
  imageUrl: string | null
  description: string | null
  creatorId: number
  members: BygMessageConversationMember[]
  lastMessagePreview: string
  lastMessageDate: string
}

export interface BygMessageConversation {
  conversationId: number
  type: 'direct' | 'group'
  name: string | null
  title: string | null
  imageUrl: string | null
  description: string | null
  creatorId: number
  members: BygMessageConversationMember[]
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
  conversationId?: number
  recipientId?: number
  content?: string
  sharedPostId?: number
  sharedImageId?: number
}

export interface BygMessageDirectConversationRequest {
  recipientId: number
}

export interface BygMessageGroupConversationRequest {
  name?: string
  title?: string
  imageUrl?: string
  description?: string
  memberIds: number[]
}

export interface BygMessageConversationInviteRequest {
  userId: number
}

export interface BygMessageConversationInfoRequest {
  name?: string | null
  title?: string | null
  imageUrl?: string | null
  description?: string | null
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
