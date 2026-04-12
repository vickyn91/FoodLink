import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { PublicListing } from '../types'
import { timeAgo } from '../lib/timeAgo'

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
          New listing
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="empty">You have no listings yet.</p>
      ) : (
        <ul className="dash-list">
          {listings.map((l) => (
            <li key={l.id} className="dash-item">
              <div>
                <strong>{l.waste_type}</strong>
                <span className="muted"> · {l.quantity}</span>
                <p className="muted small">
                  {l.address_display} · {timeAgo(l.created_at)} ·{' '}
                  <span className={`status status--${l.status}`}>{l.status}</span>
                </p>
              </div>
              <div className="dash-actions">
                <Link to={`/listings/${l.id}`} className="btn ghost small">
                  View
                </Link>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
