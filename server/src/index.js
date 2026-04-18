import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { clerkMiddleware, getAuth } from '@clerk/express';

const app = express();
app.use(express.json());

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (allowed.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);

app.use(clerkMiddleware());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function requireAuthApi(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

async function getOrCreateOrg(userId) {
  const { data: existing, error: selErr } = await supabase
    .from('organizations')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing;

  const { data: created, error: insErr } = await supabase
    .from('organizations')
    .insert({
      clerk_user_id: userId,
      name: '',
      org_type: 'generator',
      contact_email: '',
    })
    .select('*')
    .single();

  if (insErr) throw insErr;
  return created;
}

function stripFullAddress(listing) {
  if (!listing) return listing;
  const { address_full: _a, generator_id: _g, ...rest } = listing;
  return rest;
}

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// ── Organizations ──────────────────────────────────────────

app.get('/me', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);
    res.json({
      org: {
        ...org,
        needs_onboarding: !org.name || org.name.trim() === '',
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

app.post('/me', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { name, org_type, contact_email } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }
    const type = ['generator', 'buyer', 'both'].includes(org_type) ? org_type : 'generator';
    const email = typeof contact_email === 'string' ? contact_email : '';

    await getOrCreateOrg(userId);

    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: name.trim(),
        org_type: type,
        contact_email: email.trim(),
      })
      .eq('clerk_user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ org: { ...data, needs_onboarding: false } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// ── Listings ───────────────────────────────────────────────

app.post('/listings', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);
    if (!org.name || org.name.trim() === '') {
      return res.status(400).json({ error: 'Complete onboarding first' });
    }

    const { waste_type, quantity, address_full, address_display, notes } = req.body;
    if (!waste_type || !quantity || !address_full || !address_display) {
      return res.status(400).json({
        error: 'waste_type, quantity, address_full, and address_display are required',
      });
    }

    const { data, error } = await supabase
      .from('waste_listings')
      .insert({
        generator_id: org.id,
        waste_type: String(waste_type).trim(),
        quantity: String(quantity).trim(),
        address_full: String(address_full).trim(),
        address_display: String(address_display).trim(),
        notes: notes != null ? String(notes) : null,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ listing: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

app.get('/listings/mine', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);

    const { data, error } = await supabase
      .from('waste_listings')
      .select('*')
      .eq('generator_id', org.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data || [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

app.get('/listings', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('waste_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const listings = (data || []).map(stripFullAddress);
    res.json({ listings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

app.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = getAuth(req);

    const { data, error } = await supabase
      .from('waste_listings')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (userId) {
      const org = await getOrCreateOrg(userId);
      return res.json({
        listing: {
          ...data,
          is_owner: data.generator_id === org.id,
        },
      });
    }
    res.json({ listing: stripFullAddress(data) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

app.patch('/listings/:id', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'cancelled') {
      return res.status(400).json({ error: 'Only status cancelled is supported' });
    }

    const { data: row, error: fetchErr } = await supabase
      .from('waste_listings')
      .select('id, generator_id, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!row || row.generator_id !== org.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (row.status !== 'active') {
      return res.status(400).json({ error: 'Listing is not active' });
    }

    const { data, error } = await supabase
      .from('waste_listings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// ── Messages ───────────────────────────────────────────────

// Send a message (initial contact or reply)
app.post('/messages/thread/:listingId', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);
    const { listingId } = req.params;
    const { body, other_org_id } = req.body;

    if (!body || !String(body).trim()) {
      return res.status(400).json({ error: 'Message body is required' });
    }

    const { data: listing, error: listingErr } = await supabase
      .from('waste_listings')
      .select('id, generator_id, status, waste_type')
      .eq('id', listingId)
      .maybeSingle();

    if (listingErr) throw listingErr;
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    let recipientId;
    if (listing.generator_id === org.id) {
      // Owner replying — must specify who to reply to
      if (!other_org_id) {
        return res.status(400).json({ error: 'other_org_id required when replying as listing owner' });
      }
      recipientId = other_org_id;
    } else {
      // Inquirer messaging the owner
      recipientId = listing.generator_id;
    }

    if (recipientId === org.id) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        listing_id: listingId,
        sender_id: org.id,
        recipient_id: recipientId,
        body: String(body).trim(),
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ message: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// Get a conversation thread for a listing
app.get('/messages/thread/:listingId', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);
    const { listingId } = req.params;
    const { with: otherOrgId } = req.query;

    // All messages for this listing where I'm a participant
    const { data: msgs, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('listing_id', listingId)
      .or(`sender_id.eq.${org.id},recipient_id.eq.${org.id}`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // If owner with multiple inquirers, filter to specific conversation
    const thread = otherOrgId
      ? (msgs || []).filter(
          (m) => m.sender_id === otherOrgId || m.recipient_id === otherOrgId
        )
      : (msgs || []);

    // Determine the other party
    const otherPartyId =
      otherOrgId ||
      (thread.length > 0
        ? thread[0].sender_id === org.id
          ? thread[0].recipient_id
          : thread[0].sender_id
        : null);

    // Fetch org names
    const orgIds = [...new Set(thread.map((m) => m.sender_id))];
    const { data: orgs } = orgIds.length
      ? await supabase.from('organizations').select('id, name').in('id', orgIds)
      : { data: [] };
    const nameMap = Object.fromEntries((orgs || []).map((o) => [o.id, o.name]));

    // Fetch other party name
    let otherOrgName = 'Unknown';
    if (otherPartyId) {
      const { data: otherOrg } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', otherPartyId)
        .maybeSingle();
      if (otherOrg) otherOrgName = otherOrg.name;
    }

    // Fetch listing info
    const { data: listing } = await supabase
      .from('waste_listings')
      .select('id, waste_type, address_display, status')
      .eq('id', listingId)
      .maybeSingle();

    // Mark unread messages from other party as read
    const unreadIds = thread
      .filter((m) => m.recipient_id === org.id && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);
    }

    res.json({
      messages: thread.map((m) => ({
        id: m.id,
        body: m.body,
        created_at: m.created_at,
        is_mine: m.sender_id === org.id,
        sender_name: nameMap[m.sender_id] || 'Unknown',
        read_at: m.read_at,
      })),
      other_org: { id: otherPartyId, name: otherOrgName },
      listing: listing || null,
      is_owner: listing ? listing.generator_id === org.id : false,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// Inbox — all conversations for the current user
app.get('/messages/inbox', requireAuthApi, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const org = await getOrCreateOrg(userId);

    const { data: msgs, error } = await supabase
      .from('direct_messages')
      .select('id, listing_id, sender_id, recipient_id, body, created_at, read_at')
      .or(`sender_id.eq.${org.id},recipient_id.eq.${org.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!msgs || msgs.length === 0) {
      return res.json({ conversations: [] });
    }

    // Gather org IDs and listing IDs
    const otherOrgIds = [
      ...new Set(
        msgs.map((m) => (m.sender_id === org.id ? m.recipient_id : m.sender_id))
      ),
    ];
    const listingIds = [...new Set(msgs.map((m) => m.listing_id))];

    const [{ data: orgs }, { data: listings }] = await Promise.all([
      supabase.from('organizations').select('id, name').in('id', otherOrgIds),
      supabase
        .from('waste_listings')
        .select('id, waste_type, address_display, status')
        .in('id', listingIds),
    ]);

    const orgMap = Object.fromEntries((orgs || []).map((o) => [o.id, o]));
    const listingMap = Object.fromEntries((listings || []).map((l) => [l.id, l]));

    // Group into conversations: key = listingId + otherOrgId
    const convMap = new Map();
    for (const m of msgs) {
      const otherId = m.sender_id === org.id ? m.recipient_id : m.sender_id;
      const key = `${m.listing_id}__${otherId}`;

      if (!convMap.has(key)) {
        convMap.set(key, {
          listing_id: m.listing_id,
          listing: listingMap[m.listing_id] || null,
          other_org: orgMap[otherId] || { id: otherId, name: 'Unknown' },
          last_message: {
            body: m.body,
            created_at: m.created_at,
            is_mine: m.sender_id === org.id,
          },
          unread_count: 0,
        });
      }
      if (m.recipient_id === org.id && !m.read_at) {
        convMap.get(key).unread_count++;
      }
    }

    res.json({ conversations: Array.from(convMap.values()) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`FoodLink API listening on ${port}`);
});
