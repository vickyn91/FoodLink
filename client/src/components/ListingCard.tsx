import { Link } from 'react-router-dom'
import type { PublicListing } from '../types'
import { timeAgo } from '../lib/timeAgo'
import { getWasteVisual } from '../lib/wasteTypeVisuals'

type Props = { listing: PublicListing }

export function ListingCard({ listing }: Props) {
  const visual = getWasteVisual(listing.waste_type)

  return (
    <article className="listing-card">
      <Link to={`/listings/${listing.id}`} className="listing-card__link">
        <div
          className="listing-card__image"
          style={{ background: visual.bg, color: visual.text }}
        >
          <span className="listing-card__emoji">{visual.emoji}</span>
        </div>
        <div className="listing-card__body">
          <h2 className="listing-card__title">{listing.waste_type}</h2>
          <p className="listing-card__meta">{listing.quantity}</p>
          <p className="listing-card__location">📍 {listing.address_display}</p>
          <p className="listing-card__time">{timeAgo(listing.created_at)}</p>
        </div>
      </Link>
    </article>
  )
}
