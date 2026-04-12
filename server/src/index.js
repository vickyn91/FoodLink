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
  const { address_full: _a, ...rest } = listing;
  return rest;
}

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
  }
});

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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
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
      return res.json({ listing: data });
    }
    res.json({ listing: stripFullAddress(data) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`FoodLink API listening on ${port}`);
});
