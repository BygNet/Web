import type { BygUserSuggestion } from '@/types/mentions'
import type { BygMessage } from '@/types/messages'

export type MessageDeliveryState = 'sending' | 'sent'
export type MessageGroupPosition = 'single' | 'top' | 'middle' | 'bottom'

export type ConversationTimestampEntry = {
  type: 'timestamp'
  key: string
  label: string
}

export type ConversationMessageEntry = {
  type: 'message'
  key: string
  message: BygMessage
  outgoing: boolean
  showAvatar: boolean
  showSenderName: boolean
  groupPosition: MessageGroupPosition
  deliveryState: MessageDeliveryState | null
}

export type ConversationEntry =
  ConversationTimestampEntry | ConversationMessageEntry

export type MessagesGroupForm = {
  title: string
  imageUrl: string
  description: string
  memberQuery: string
  memberSuggestions: BygUserSuggestion[]
  selectedMemberIds: number[]
  selectedMemberDrafts: BygUserSuggestion[]
  statusMessage: string | null
}
