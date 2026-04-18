export type PublicListing = {
  id: string
  waste_type: string
  quantity: string
  address_display: string
  created_at: string
  status?: string
  notes?: string | null
  address_full?: string
  generator_id?: string
  is_owner?: boolean
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

export type Message = {
  id: string
  body: string
  created_at: string
  is_mine: boolean
  sender_name: string
  read_at: string | null
}

export type Conversation = {
  listing_id: string
  listing: {
    id: string
    waste_type: string
    address_display: string
    status: string
  } | null
  other_org: {
    id: string
    name: string
  }
  last_message: {
    body: string
    created_at: string
    is_mine: boolean
  }
  unread_count: number
}
