import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const WASTE_TYPES = [
  'Coffee grounds',
  'Spent grain',
  'Vegetable trim',
  'Fruit scraps',
  'Bread / bakery',
  'Dairy by-products',
  'Food-soiled cardboard',
  'Oil / grease',
  'Pre-consumer food waste',
  'Post-consumer food waste',
  'Compostables (mixed)',
  'Other organic waste',
]

const UNITS = ['kg', 'lb', 'liter', 'gallon', 'ton', 'bag', 'bin', 'box', 'pallet']
const FREQUENCIES = ['one-time', 'per day', 'per week', 'per month']

function buildQuantity(num: string, unit: string, freq: string) {
  if (!num) return ''
  return freq === 'one-time' ? `${num} ${unit}` : `${num} ${unit} / ${freq}`
}

export function NewListingPage() {
  const navigate = useNavigate()

  const [wasteType, setWasteType] = useState('')
  const [qtyNum, setQtyNum] = useState('')
  const [qtyUnit, setQtyUnit] = useState('kg')
  const [qtyFreq, setQtyFreq] = useState('per week')
  const [pickup, setPickup] = useState(false)
  const [dropoff, setDropoff] = useState(false)
  const [zip, setZip] = useState('')
  const [cityState, setCityState] = useState('')
  const [zipStatus, setZipStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [streetAddress, setStreetAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function lookupZip(value: string) {
    if (value.length !== 5 || !/^\d{5}$/.test(value)) return
    setZipStatus('loading')
    setCityState('')
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${value}`)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      const place = data.places[0]
      setCityState(`${place['place name']}, ${place['state abbreviation']}`)
      setZipStatus('ok')
    } catch {
      setCityState('')
      setZipStatus('error')
    }
  }

  function handleZipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 5)
    setZip(v)
    setZipStatus('idle')
    setCityState('')
    if (v.length === 5) lookupZip(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!wasteType) return setError('Please select a waste type.')
    if (!qtyNum || Number(qtyNum) <= 0) return setError('Please enter a valid quantity.')
    if (!pickup && !dropoff) return setError('Select at least one availability option (pick-up or drop-off).')
    if (!cityState) return setError('Enter a valid 5-digit zip code.')

    const availability = [pickup && 'pick-up', dropoff && 'drop-off'].filter(Boolean).join(', ')
    const notesLines = [
      `Availability: ${availability}`,
      notes.trim() || null,
    ].filter(Boolean).join('\n')

    const addressDisplay = cityState
    const addressFull = streetAddress.trim()
      ? `${streetAddress.trim()}, ${cityState} ${zip}`
      : `${cityState} ${zip}`

    setLoading(true)
    try {
      await api.post('/listings', {
        waste_type: wasteType,
        quantity: buildQuantity(qtyNum, qtyUnit, qtyFreq),
        address_full: addressFull,
        address_display: addressDisplay,
        notes: notesLines,
      })
      navigate('/dashboard/listings')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Could not create listing. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>New listing</h1>
      <p className="lede">Describe surplus food or organic waste available for recovery.</p>
      <form onSubmit={handleSubmit} className="form">

        {/* Waste type */}
        <label className="field">
          <span>Waste type</span>
          <select value={wasteType} onChange={(e) => setWasteType(e.target.value)} required>
            <option value="">— select a category —</option>
            {WASTE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        {/* Quantity */}
        <div className="field">
          <span>Quantity</span>
          <div className="quantity-row">
            <input
              type="number"
              min="0.1"
              step="any"
              value={qtyNum}
              onChange={(e) => setQtyNum(e.target.value)}
              placeholder="Amount"
              required
            />
            <select value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={qtyFreq} onChange={(e) => setQtyFreq(e.target.value)}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Availability */}
        <div className="field">
          <span>Availability</span>
          <div className="checkbox-row">
            <label>
              <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} />
              Pick-Up
            </label>
            <label>
              <input type="checkbox" checked={dropoff} onChange={(e) => setDropoff(e.target.checked)} />
              Drop-Off
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="field">
          <span>Zip code</span>
          <div className="zip-row">
            <input
              value={zip}
              onChange={handleZipChange}
              placeholder="e.g. 94103"
              inputMode="numeric"
              required
            />
            <input
              value={cityState}
              onChange={(e) => setCityState(e.target.value)}
              placeholder={
                zipStatus === 'loading' ? 'Looking up…' :
                zipStatus === 'error' ? 'Zip not found — enter manually' :
                'City, State'
              }
              required
            />
          </div>
          <p className="hint">Zip is auto-detected. The city/state is shown publicly; your full address is private.</p>
        </div>

        <label className="field">
          <span>Street address (private — shown only to signed-in users)</span>
          <input
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="123 Main St (optional)"
          />
        </label>

        <label className="field">
          <span>Additional notes (optional)</span>
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
