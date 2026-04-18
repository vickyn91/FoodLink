import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { PublicListing } from '../types'
import { timeAgo } from '../lib/timeAgo'
import { getWasteVisual } from '../lib/wasteTypeVisuals'

export function DashboardListingsPage() {
  const [listings, setListings] = useState<PublicListing[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  function load() {
    api
      .get<{ listings: PublicListing[] }>('/listings/mine')
      .then((res) => setListings(res.data.listings))
      .catch(() => setListings([]))
  }

  useEffect(() => {
    load()
  }, [])

  async function cancel(id: string) {
    setBusyId(id)
    try {
      await api.patch(`/listings/${id}`, { status: 'cancelled' })
      load()
    } finally {
      setBusyId(null)
    }
  }

  if (listings === null) {
    return <p className="muted">Loading your listings…</p>
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>My listings</h1>
        <Link to="/listings/new" className="btn primary small">
          + New listing
        </Link>
      </div>
      {listings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__emoji">🌱</p>
          <p className="empty-state__msg">You haven't posted any listings yet.</p>
          <Link to="/listings/new" className="btn primary">Create your first listing</Link>
        </div>
      ) : (
        <div className="card-grid">
          {listings.map((l) => {
            const visual = getWasteVisual(l.waste_type)
            return (
              <article key={l.id} className={`listing-card${l.status === 'cancelled' ? ' listing-card--cancelled' : ''}`}>
                <div
                  className="listing-card__image"
                  style={{ background: visual.bg, color: visual.text }}
                >
                  <span className="listing-card__emoji">{visual.emoji}</span>
                  <span className={`listing-card__badge status--${l.status}`}>{l.status}</span>
                </div>
                <div className="listing-card__body">
                  <h2 className="listing-card__title">{l.waste_type}</h2>
                  <p className="listing-card__meta">{l.quantity}</p>
                  <p className="listing-card__location">📍 {l.address_display}</p>
                  <p className="listing-card__time">{timeAgo(l.created_at)}</p>
                  <div className="listing-card__actions">
                    <Link to={`/listings/${l.id}`} className="btn ghost small">View</Link>
                    {l.status === 'active' && (
                      <button
                        type="button"
                        className="btn danger small"
                        disabled={busyId === l.id}
                        onClick={() => cancel(l.id)}
                      >
                        {busyId === l.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
