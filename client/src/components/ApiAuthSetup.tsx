import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { api } from '../api/client'

export function ApiAuthSetup() {
  const { getToken } = useAuth()

  useEffect(() => {
    const id = api.interceptors.request.use(async (config) => {
      const token = await getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        delete config.headers.Authorization
      }
      return config
    })
    return () => {
      api.interceptors.request.eject(id)
    }
  }, [getToken])

  return null
}
