import { useEffect, useState } from 'react'
import { ListingCard } from '../components/ListingCard'
import { api } from '../api/client'
import type { PublicListing } from '../types'

export function ListingsPage() {
  const [listings, setListings] = useState<PublicListing[] | null>(null)

  useEffect(() => {
    api
      .get<{ listings: PublicListing[] }>('/listings')
      .then((res) => setListings(res.data.listings))
      .catch(() => setListings([]))
  }, [])

  if (!listings) {
    return <p className="muted">Loading listings…</p>
  }

  if (listings.length === 0) {
    return (
      <div className="page">
        <h1>Active listings</h1>
        <p className="empty">No listings yet.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Active listings</h1>
      <div className="card-grid">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </div>
  )
}
