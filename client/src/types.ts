export type PublicListing = {
  id: string
  waste_type: string
  quantity: string
  address_display: string
  created_at: string
  status?: string
  notes?: string | null
  address_full?: string
}

export type Org = {
  id: string
  clerk_user_id: string
  name: string
  org_type: string
  contact_email: string
  created_at: string
  needs_onboarding?: boolean
}
