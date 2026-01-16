import { reactive } from 'vue'

export const auth = reactive<{
  token: string | null
  user: null | {
    id: number
    email: string
    username: string
  }
}>({
  token: localStorage.getItem('token'),
  user: null,
})
