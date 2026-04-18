import { Link } from 'react-router-dom'
import { NavBar } from '../components/NavBar'

export function HomePage() {
  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="lp-hero">
        {/*
          To use a real photo, replace the gradient in .lp-hero (in index.css)
          with: background-image: url('YOUR_IMAGE_URL'); background-size: cover;
        */}
        <NavBar transparent />

        <div className="lp-hero__content">
          <p className="lp-eyebrow">🌍 Circular. Local. Sustainable.</p>
          <h1 className="lp-title">
            One farm's waste<br />is another's feast.
          </h1>
          <p className="lp-subtitle">
            FoodLink connects food waste generators with the organizations and farmers
            who can put that surplus to extraordinary use — turning landfill-bound
            organic material into feed, compost, and community.
          </p>
          <div className="lp-ctas">
            <Link to="/listings" className="btn lp-btn-primary">Browse listings</Link>
            <Link to="/sign-up" className="btn lp-btn-ghost">Join FoodLink →</Link>
          </div>
        </div>
        <div className="lp-hero__scroll-hint" aria-hidden>↓</div>
      </section>

      {/* ── About ────────────────────────────────── */}
      <section className="lp-section lp-about">
        <div className="lp-about__grid">
          <div className="lp-about__visual" aria-hidden>
            <div className="lp-globe">
              <span>🌍</span>
              <div className="lp-globe__ring" />
            </div>
          </div>
          <div className="lp-about__text">
            <p className="lp-section-label">Our Mission</p>
            <h2>Closing the loop on food waste.</h2>
            <p>
              Every year, millions of tons of perfectly usable organic material —
              coffee grounds, spent grain, vegetable trim, bakery surplus — ends up
              in landfills. There, it rots and releases methane, a greenhouse gas
              over 80× more potent than CO₂.
            </p>
            <p>
              But here's the thing: <strong>that waste is someone else's gold.</strong>
              A brewery's spent grain is a farmer's livestock feed. A café's coffee grounds
              are a mushroom grower's substrate. A grocer's vegetable trim is a composter's
              raw material.
            </p>
            <p>
              FoodLink makes those connections effortless — a transparent, easy-to-use
              marketplace where surplus finds purpose and communities grow stronger together.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────── */}
      <section className="lp-section lp-stats">
        <div className="lp-stats__grid">
          <div className="lp-stat">
            <p className="lp-stat__number">⅓</p>
            <p className="lp-stat__label">of all food produced globally is wasted each year</p>
          </div>
          <div className="lp-stat">
            <p className="lp-stat__number">8%</p>
            <p className="lp-stat__label">of global greenhouse gas emissions come from food waste</p>
          </div>
          <div className="lp-stat">
            <p className="lp-stat__number">80×</p>
            <p className="lp-stat__label">more potent than CO₂ — the impact of methane from landfilled organics</p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────── */}
      <section className="lp-section lp-how">
        <p className="lp-section-label">Simple by design</p>
        <h2>How FoodLink works</h2>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step__icon">📋</div>
            <h3>List your surplus</h3>
            <p>
              Generators post available organic waste — type, quantity, frequency,
              and pickup or drop-off availability. Takes under two minutes.
            </p>
          </div>
          <div className="lp-step__connector" aria-hidden>→</div>
          <div className="lp-step">
            <div className="lp-step__icon">🔍</div>
            <h3>Browse &amp; connect</h3>
            <p>
              Buyers and farmers browse active listings. When they find a match,
              they message the owner directly — no middlemen, no fees.
            </p>
          </div>
          <div className="lp-step__connector" aria-hidden>→</div>
          <div className="lp-step">
            <div className="lp-step__icon">♻️</div>
            <h3>Close the loop</h3>
            <p>
              Surplus finds a new life. Landfill is avoided. Emissions drop.
              And two organizations build a relationship that benefits them both.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────── */}
      <section className="lp-section lp-who">
        <p className="lp-section-label">Who we serve</p>
        <h2>Built for the whole ecosystem</h2>
        <div className="lp-who__grid">
          {[
            { icon: '🏭', title: 'Food manufacturers', desc: 'List production surplus, trim, and by-products.' },
            { icon: '☕', title: 'Cafés & breweries', desc: 'Find homes for coffee grounds, spent grain, and more.' },
            { icon: '🛒', title: 'Grocers & markets', desc: 'Connect unsold produce and bakery with local recipients.' },
            { icon: '🐄', title: 'Farms & ranches', desc: 'Source affordable organic feed and compost inputs.' },
            { icon: '🌱', title: 'Composters & growers', desc: 'Build reliable supply chains for organic material.' },
            { icon: '🤝', title: 'Nonprofits & co-ops', desc: 'Redirect edible surplus toward communities in need.' },
          ].map((card) => (
            <div key={card.title} className="lp-who-card">
              <span className="lp-who-card__icon">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner__content">
          <h2>Ready to turn waste into value?</h2>
          <p>
            Join a growing network of businesses and organizations working together
            for a cleaner, more circular food system.
          </p>
          <div className="lp-ctas">
            <Link to="/sign-up" className="btn lp-btn-primary">Create a free account</Link>
            <Link to="/listings" className="btn lp-btn-ghost">Explore listings</Link>
          </div>
        </div>
        <div className="lp-cta-banner__deco" aria-hidden>🌿</div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="lp-footer">
        <p>© {new Date().getFullYear()} FoodLink · Building a circular food economy, one connection at a time.</p>
      </footer>
    </div>
  )
}
