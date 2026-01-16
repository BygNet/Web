import { api } from '@/api/client.ts'
import { auth } from '@/auth/session.ts'

export async function signup(
  email: string,
  username: string,
  password: string
) {
  const res = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      username,
      password,
    }),
  })

  if (!res.ok) throw new Error('Signup failed')

  const data = await res.json()

  auth.token = data.token
  auth.user = data.user

  localStorage.setItem('token', data.token)
}
