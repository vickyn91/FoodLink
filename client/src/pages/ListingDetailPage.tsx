import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { PublicListing } from '../types'
import { timeAgo } from '../lib/timeAgo'

export function ListingDetailPage() {
  const { id } = useParams()
  const { isSignedIn, isLoaded } = useAuth()
  const [listing, setListing] = useState<PublicListing | null | 'loading'>('loading')

  useEffect(() => {
    if (!id) return
    api
      .get<{ listing: PublicListing }>(`/listings/${id}`)
      .then((res) => setListing(res.data.listing))
      .catch(() => setListing(null))
  }, [id, isSignedIn, isLoaded])

  if (listing === 'loading') {
    return <p className="muted">Loading…</p>
  }

  if (listing === null) {
    return (
      <div className="page">
        <p>Listing not found.</p>
        <Link to="/listings">Back to listings</Link>
      </div>
    )
  }

  const showFullAddress = isSignedIn && listing.address_full

  return (
    <div className="page narrow">
      <Link to="/listings" className="back">
        ← All listings
      </Link>
      <article className="detail">
        <h1>{listing.waste_type}</h1>
        <p className="detail__quantity">{listing.quantity}</p>
        <p className="detail__location">
          <strong>Area:</strong> {listing.address_display}
        </p>
        <p className="detail__time">Posted {timeAgo(listing.created_at)}</p>
        {listing.notes && (
          <p className="detail__notes">
            <strong>Notes:</strong> {listing.notes}
          </p>
        )}
        <div className="detail__address">
          <strong>Full address</strong>
          {showFullAddress ? (
            <p>{listing.address_full}</p>
          ) : (
            <p className="muted">
              <Link to="/sign-in">Sign in</Link> to see the full address.
            </p>
          )}
        </div>
      </article>
    </div>
  )
}
