import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [orgType, setOrgType] = useState('generator')
  const [contactEmail, setContactEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/me', {
        name,
        org_type: orgType,
        contact_email: contactEmail,
      })
      navigate('/listings', { replace: true })
    } catch {
      setError('Could not save your profile. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>Welcome to FoodLink</h1>
      <p className="lede">Tell us about your organization to continue.</p>
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Organization or name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="organization"
          />
        </label>
        <label className="field">
          <span>I am a</span>
          <select value={orgType} onChange={(e) => setOrgType(e.target.value)}>
            <option value="generator">Generator (I have surplus food / waste)</option>
            <option value="buyer">Buyer</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="field">
          <span>Contact email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
