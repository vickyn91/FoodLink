import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Message } from '../types'
import { timeAgo } from '../lib/timeAgo'
import { getWasteVisual } from '../lib/wasteTypeVisuals'

type ThreadData = {
  messages: Message[]
  other_org: { id: string; name: string }
  listing: { id: string; waste_type: string; address_display: string; status: string } | null
  is_owner: boolean
}

export function ThreadPage() {
  const { listingId } = useParams()
  const [searchParams] = useSearchParams()
  const otherOrgId = searchParams.get('with')

  const [thread, setThread] = useState<ThreadData | null>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  function buildUrl() {
    const base = `/messages/thread/${listingId}`
    return otherOrgId ? `${base}?with=${otherOrgId}` : base
  }

  async function loadThread() {
    try {
      const res = await api.get<ThreadData>(buildUrl())
      setThread(res.data)
    } catch {
      setThread(null)
    }
  }

  useEffect(() => {
    if (listingId) loadThread()
  }, [listingId, otherOrgId])

  // Scroll to bottom when messages load or new one arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !listingId) return
    setSendError('')
    setSending(true)
    try {
      const payload: Record<string, string> = { body: body.trim() }
      if (thread?.is_owner && thread.other_org.id) {
        payload.other_org_id = thread.other_org.id
      }
      await api.post(`/messages/thread/${listingId}`, payload)
      setBody('')
      await loadThread()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Could not send message.'
      setSendError(msg)
    } finally {
      setSending(false)
    }
  }

  if (thread === null) {
    return (
      <div className="page narrow">
        <Link to="/messages" className="back">← Messages</Link>
        <p className="muted">Could not load conversation.</p>
      </div>
    )
  }

  if (!thread) {
    return <p className="muted">Loading…</p>
  }

  const visual = thread.listing ? getWasteVisual(thread.listing.waste_type) : { emoji: '🌱', bg: '#6b7a6a' }

  return (
    <div className="page narrow thread-page">
      {/* Header */}
      <Link to="/messages" className="back">← Messages</Link>
      <div className="thread-header">
        <div className="thread-header__icon" style={{ background: visual.bg }}>
          {visual.emoji}
        </div>
        <div>
          <p className="thread-header__title">
            {thread.listing?.waste_type ?? 'Listing'}
          </p>
          <p className="thread-header__sub">
            {thread.listing?.address_display} · with <strong>{thread.other_org.name}</strong>
          </p>
        </div>
        {thread.listing && (
          <Link to={`/listings/${thread.listing.id}`} className="btn ghost small thread-header__view">
            View listing
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="thread-messages">
        {thread.messages.length === 0 ? (
          <p className="thread-empty">No messages yet. Say hello!</p>
        ) : (
          thread.messages.map((m) => (
            <div key={m.id} className={`bubble-wrap ${m.is_mine ? 'bubble-wrap--mine' : 'bubble-wrap--theirs'}`}>
              {!m.is_mine && (
                <p className="bubble-sender">{m.sender_name}</p>
              )}
              <div className={`bubble ${m.is_mine ? 'bubble--mine' : 'bubble--theirs'}`}>
                {m.body}
              </div>
              <p className="bubble-time">{timeAgo(m.created_at)}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <form onSubmit={handleSend} className="thread-reply">
        <textarea
          className="thread-reply__input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as React.FormEvent)
            }
          }}
        />
        {sendError && <p className="error">{sendError}</p>}
        <div className="thread-reply__footer">
          <p className="hint">Press Enter to send · Shift+Enter for new line</p>
          <button type="submit" className="btn primary" disabled={sending || !body.trim()}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
