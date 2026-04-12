import { Link, Outlet } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

export function Layout() {
  return (
    <div className="shell">
      <header className="header">
        <Link to="/listings" className="logo">
          FoodLink
        </Link>
        <nav className="nav">
          <Link to="/listings">Listings</Link>
          <SignedIn>
            <Link to="/listings/new">New listing</Link>
            <Link to="/dashboard/listings">My listings</Link>
            <UserButton afterSignOutUrl="/listings" />
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up" className="nav__cta">
              Sign up
            </Link>
          </SignedOut>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
