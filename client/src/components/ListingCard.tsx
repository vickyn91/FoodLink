import { Link } from 'react-router-dom'
import type { PublicListing } from '../types'
import { timeAgo } from '../lib/timeAgo'

type Props = { listing: PublicListing }

export function ListingCard({ listing }: Props) {
  return (
    <article className="listing-card">
      <Link to={`/listings/${listing.id}`} className="listing-card__link">
        <h2 className="listing-card__title">{listing.waste_type}</h2>
        <p className="listing-card__meta">{listing.quantity}</p>
        <p className="listing-card__location">{listing.address_display}</p>
        <p className="listing-card__time">{timeAgo(listing.created_at)}</p>
      </Link>
    </article>
  )
}
