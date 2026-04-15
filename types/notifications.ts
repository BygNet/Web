import type { BygSubscription } from '@bygnet/types'

export type BygNotificationType =
  | 'follow'
  | 'post_comment'
  | 'image_comment'
  | 'post_mention'
  | 'comment_mention'
  | 'message'

export interface BygNotification {
  id: string
  type: BygNotificationType
  actorUsername: string
  actorAvatarUrl: string | null
  actorSubscriptionState: BygSubscription
  text: string
  path: string
  createdDate: string
}
