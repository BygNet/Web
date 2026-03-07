export interface BygPushSubscriptionKeys {
  p256dh: string
  auth: string
}

export interface BygPushSubscription {
  endpoint: string
  expirationTime: number | null
  keys: BygPushSubscriptionKeys
}

export interface BygPushUnsubscribeRequest {
  endpoint: string
}

export interface BygPushPublicKeyResponse {
  publicKey: string
}

export interface BygPushAlertPayload {
  type: 'follow' | 'post_comment' | 'image_comment'
  title: string
  body: string
  path: string
  tag: string
  createdDate: string
}
