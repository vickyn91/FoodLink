import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

type Props = { transparent?: boolean }

export function NavBar({ transparent = false }: Props) {
  return (
    <header className={`header${transparent ? ' header--transparent' : ''}`}>
      <Link to="/" className="logo">FoodLink</Link>
      <nav className="nav">
        <Link to="/listings">Listings</Link>
        <SignedIn>
          <Link to="/listings/new">New listing</Link>
          <Link to="/dashboard/listings">My listings</Link>
          <Link to="/messages">Messages</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link to="/sign-in">Log In</Link>
          <Link to="/sign-up" className="nav__cta">New Account</Link>
        </SignedOut>
      </nav>
    </header>
  )
}
