import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

export function Layout() {
  return (
    <div className="shell">
      <NavBar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
