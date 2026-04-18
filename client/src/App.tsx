import { ClerkProvider, SignedIn } from '@clerk/clerk-react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ApiAuthSetup } from './components/ApiAuthSetup'
import { Layout } from './components/Layout'
import { OnboardingRedirect } from './components/OnboardingRedirect'
import { RequireAuth } from './components/RequireAuth'
import { DashboardListingsPage } from './pages/DashboardListingsPage'
import { HomePage } from './pages/HomePage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { ListingsPage } from './pages/ListingsPage'
import { MessagesPage } from './pages/MessagesPage'
import { NewListingPage } from './pages/NewListingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ThreadPage } from './pages/ThreadPage'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function AppRoutes() {
  return (
    <>
      <SignedIn>
        <ApiAuthSetup />
        <OnboardingRedirect />
      </SignedIn>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        <Route element={<Layout />}>
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/listings/new" element={<NewListingPage />} />
          <Route path="/dashboard/listings" element={<DashboardListingsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:listingId" element={<ThreadPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  if (!clerkKey) {
    return (
      <p className="error pad">
        Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code>. Copy{' '}
        <code>client/.env.example</code> to <code>client/.env</code> and fill in values.
      </p>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClerkProvider>
  )
}
