import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Conversation } from '../types'
import { timeAgo } from '../lib/timeAgo'
import { getWasteVisual } from '../lib/wasteTypeVisuals'

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null)

  useEffect(() => {
    api
      .get<{ conversations: Conversation[] }>('/messages/inbox')
      .then((res) => setConversations(res.data.conversations))
      .catch(() => setConversations([]))
  }, [])

  if (conversations === null) {
    return <p className="muted">Loading messages…</p>
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__emoji">💬</p>
          <p className="empty-state__msg">No conversations yet.</p>
          <Link to="/listings" className="btn primary">Browse listings</Link>
        </div>
      ) : (
        <ul className="inbox-list">
          {conversations.map((conv) => {
            const visual = conv.listing ? getWasteVisual(conv.listing.waste_type) : { emoji: '🌱', bg: '#6b7a6a' }
            const threadUrl = `/messages/${conv.listing_id}?with=${conv.other_org.id}`
            return (
              <li key={`${conv.listing_id}-${conv.other_org.id}`}>
                <Link to={threadUrl} className="inbox-item">
                  <div
                    className="inbox-item__icon"
                    style={{ background: visual.bg }}
                  >
                    {visual.emoji}
                  </div>
                  <div className="inbox-item__body">
                    <div className="inbox-item__top">
                      <span className="inbox-item__title">
                        {conv.listing?.waste_type ?? 'Listing'}
                      </span>
                      <span className="inbox-item__time">
                        {timeAgo(conv.last_message.created_at)}
                      </span>
                    </div>
                    <p className="inbox-item__party">{conv.other_org.name}</p>
                    <p className="inbox-item__preview">
                      {conv.last_message.is_mine ? 'You: ' : ''}
                      {conv.last_message.body}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="inbox-item__badge">{conv.unread_count}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
