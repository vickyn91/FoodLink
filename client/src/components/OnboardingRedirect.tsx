import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api } from '../api/client'

export function OnboardingRedirect() {
  const { isSignedIn, isLoaded } = useAuth()
  const location = useLocation()
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setNeedsOnboarding(null)
      return
    }
    let cancelled = false
    api
      .get<{ org: { needs_onboarding: boolean } }>('/me')
      .then((res) => {
        if (!cancelled) setNeedsOnboarding(res.data.org.needs_onboarding)
      })
      .catch(() => {
        if (!cancelled) setNeedsOnboarding(null)
      })
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, location.pathname])

  if (!isLoaded || !isSignedIn || needsOnboarding === null) return null

  const path = location.pathname
  const skip =
    path.startsWith('/onboarding') ||
    path.startsWith('/sign-in') ||
    path.startsWith('/sign-up')

  if (needsOnboarding && !skip) {
    return <Navigate to="/onboarding" replace />
  }
  return null
}
