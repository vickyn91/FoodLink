import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function NewListingPage() {
  const navigate = useNavigate()
  const [wasteType, setWasteType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [addressFull, setAddressFull] = useState('')
  const [addressDisplay, setAddressDisplay] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/listings', {
        waste_type: wasteType,
        quantity,
        address_full: addressFull,
        address_display: addressDisplay,
        notes: notes || null,
      })
      navigate('/dashboard/listings')
    } catch {
      setError('Could not create listing. Check the form and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>New listing</h1>
      <p className="lede">Describe surplus food or organic waste available for recovery.</p>
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Waste type</span>
          <input
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            placeholder="e.g. Coffee grounds"
            required
          />
        </label>
        <label className="field">
          <span>Quantity</span>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 20 kg/week"
            required
          />
        </label>
        <label className="field">
          <span>Full address (private — signed-in users only)</span>
          <input
            value={addressFull}
            onChange={(e) => setAddressFull(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Public location label</span>
          <input
            value={addressDisplay}
            onChange={(e) => setAddressDisplay(e.target.value)}
            placeholder="City or neighborhood shown on the public feed"
            required
          />
        </label>
        <label className="field">
          <span>Notes (optional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
