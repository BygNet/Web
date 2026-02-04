import type { BygAd, BygImage, BygPost } from '@bygnet/types'
import { type Ref, ref } from 'vue'

// Posts Cache
export const postCache: Ref<BygPost[] | null> = ref(null)
export const postCacheTime: Ref<number> = ref(0)

export const imageCache: Ref<BygImage[] | null> = ref(null)
export const imageCacheTime: Ref<number> = ref(0)

export const adCache: Ref<BygAd[]> = ref([])
