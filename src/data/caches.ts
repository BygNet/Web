import { type Ref, ref } from 'vue'

import type { BygImage,BygPost } from '@/types/contentTypes.ts'

// Posts Cache
export const postCache: Ref<BygPost[] | null> = ref(null)
export const postCacheTime: Ref<number> = ref(0)

export const imageCache: Ref<BygImage[] | null> = ref(null)
export const imageCacheTime: Ref<number> = ref(0)
