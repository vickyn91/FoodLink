import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { PublicListing } from '../types'
import { timeAgo } from '../lib/timeAgo'
import { getWasteVisual } from '../lib/wasteTypeVisuals'

export function ListingDetailPage() {
  const { id } = useParams()
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
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

  const visual = getWasteVisual(listing.waste_type)
  const showFullAddress = isSignedIn && listing.address_full

  return (
    <div className="page narrow">
      <Link to="/listings" className="back">← All listings</Link>
      <article className="detail">
        <div className="detail__hero" style={{ background: visual.bg }}>
          <span style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>
            {visual.emoji}
          </span>
        </div>
        <div className="detail__content">
          <h1>{listing.waste_type}</h1>
          <p className="detail__quantity">{listing.quantity}</p>
          <p className="detail__location">📍 {listing.address_display}</p>
          <p className="detail__time">Posted {timeAgo(listing.created_at)}</p>
          {listing.notes && (
            <p className="detail__notes">{listing.notes}</p>
          )}
          <div className="detail__address">
            <strong>Full address</strong>
            {showFullAddress ? (
              <p style={{ marginTop: '0.4rem' }}>{listing.address_full}</p>
            ) : (
              <p className="muted" style={{ marginTop: '0.4rem' }}>
                <Link to="/sign-in">Sign in</Link> to see the full address.
              </p>
            )}
          </div>

          {isSignedIn && !listing.is_owner && (
            <div className="detail__cta">
              <button
                className="btn primary"
                onClick={() => navigate(`/messages/${listing.id}`)}
              >
                💬 Message owner
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
