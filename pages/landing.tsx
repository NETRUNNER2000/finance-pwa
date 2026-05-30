import Head from 'next/head'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Track income and expenses, see category flows, and understand 12-month trends in one personal finance workspace."
        />
      </Head>

      <main className="landing-root">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        {/* HEADER */}
        <header className="topbar">
          <div className="brand">Stonks Personal Finance</div>

          <nav className="top-actions">
            <Link href="/login" className="btn btn-ghost">Log In</Link>
            <Link href="/register" className="btn btn-solid">Sign Up</Link>
          </nav>


        </header>
            <div className="mobile-auth">
              <Link href="/login" className="btn btn-ghost">Log In</Link>
              <Link href="/register" className="btn btn-solid">Sign Up</Link>
            </div>

        {/* HERO */}
        <section className="hero">
          <div>

            <p className="eyebrow">Personal Finance, Visualized</p>

            <h1>
              See where your money comes from, where it goes, and what changes month to month.
            </h1>

            <p className="hero-copy">
              Budget Atlas turns your transactions into clear visuals: category flow maps,
              12-month trend lines, and date-range filtering so you can actually understand
              your spending behavior.
            </p>

            <div className="cta-row">
              <Link href="/register" className="btn btn-solid">
                Create Free Account
              </Link>
              <Link href="/login" className="btn btn-ghost">
                I Already Have an Account
              </Link>
            </div>


          </div>

          <div className="hero-card">
            <h3>Live Snapshot</h3>
            <p>Preview of the dashboard visuals</p>

            <div className="mini-grid">
              <div className="stat">
                <span>Income</span>
                <strong>R 34,200</strong>
              </div>
              <div className="stat">
                <span>Expenses</span>
                <strong>R 23,910</strong>
              </div>
              <div className="stat full">
                <span>Net This Month</span>
                <strong>R 10,290</strong>
              </div>
            </div>
          </div>
        </section>

        {/* VISUALS */}
        <section className="visuals">
          <article className="panel">
            <h2>Category Flow View</h2>
            <p>
              Instantly identify your biggest spending streams with flow-style category totals.
            </p>

            <img
              src="/images/SankeyChart.png"
              alt="Sankey chart"
              className="chart-img"
            />
          </article>

          <article className="panel">
            <h2>12-Month Trend Line</h2>
            <p>
              Track trajectory over time and spot spikes, seasonality, and progress.
            </p>

            <img
              src="/images/LineChart.png"
              alt="Line chart"
              className="chart-img"
            />
          </article>
        </section>

        {/* FEATURES */}
        <section className="feature-strip">
          <div className="feature">
            <h3>Fast Filtering</h3>
            <p>Adjust date ranges instantly without losing context.</p>
          </div>
          <div className="feature">
            <h3>Shared Accounts</h3>
            <p>Keep household finances aligned across users.</p>
          </div>
          <div className="feature">
            <h3>Actionable Clarity</h3>
            <p>Turn transactions into decisions, not confusion.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="closing">
          <h2>Start seeing your finances clearly.</h2>
          <p>Sign up in under a minute and get instant insight.</p>

          <div className="cta-row center">
            <Link href="/register" className="btn btn-solid">Sign Up</Link>
            <Link href="/login" className="btn btn-ghost">Log In</Link>
          </div>
        </section>
      </main>

      <style jsx>{`
        /* ======================
           BASE THEME (CLEAN DARK)
        ====================== */
        .landing-root {
          min-height: 100vh;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;

          color: #e5e7eb;
          background: #0b0f14;

          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }

        /* Ambient blobs */
        .ambient {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.35;
          pointer-events: none;
        }

        .ambient-a {
          width: 280px;
          height: 280px;
          background: #7c3aed;
          left: -80px;
          top: 120px;
        }

        @media (max-width: 900px) {
  .mobile-auth {
    display: flex;
  }
}
        .mobile-auth {
          margin-top: 0;
          margin-bottom: 0;     
          display: none;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .ambient-b {
          width: 260px;
          height: 260px;
          background: #06b6d4;
          right: -80px;
          bottom: 100px;
        }

        /* ======================
           HEADER
        ====================== */
        .topbar {
          max-width: 1100px;
          margin: 0 auto;

          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .brand {
          font-weight: 800;
          letter-spacing: 0.06em;
          font-size: 1rem;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .top-actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        /* ======================
           HERO
        ====================== */
        .hero {
          max-width: 1100px;
          margin: 2.5rem auto 0;

          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
        }

        .eyebrow {
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.75rem;
          font-weight: 700;
        }

        h1 {
          font-size: clamp(1.8rem, 4vw, 3rem);
          line-height: 1.1;
          margin: 0.5rem 0 1rem;
        }

        .hero-copy {
          color: #9ca3af;
          line-height: 1.6;
          max-width: 55ch;
        }

        .cta-row {
          display: flex;
          gap: 0.8rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .cta-row.center {
          justify-content: center;
        }

        /* ======================
           BUTTONS
        ====================== */
        .btn {
          padding: 0.7rem 1rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: 0.15s ease;
          white-space: nowrap;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn-solid {
          background: #7c3aed;
          color: white;
        }

        .btn-solid:hover {
          background: #6d28d9;
        }

        .btn-ghost {
          border: 1px solid #2a3441;
          background: rgba(255,255,255,0.03);
          color: #e5e7eb;
        }

        /* ======================
           CARDS
        ====================== */
        .hero-card,
        .panel,
        .feature,
        .closing {
          background: rgba(255,255,255,0.03);
          border: 1px solid #1f2937;
          border-radius: 16px;
          padding: 1.2rem;
          backdrop-filter: blur(10px);
        }

        .hero-card p {
          color: #9ca3af;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .stat {
          padding: 0.7rem;
          border-radius: 12px;
          background: rgba(0,0,0,0.2);
          border: 1px solid #1f2937;
        }

        .stat.full {
          grid-column: 1 / -1;
        }

        .stat span {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .stat strong {
          display: block;
          margin-top: 0.2rem;
        }

        /* ======================
           VISUALS
        ====================== */
        .visuals {
          max-width: 1100px;
          margin: 2rem auto 0;

          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .chart-img {
          width: 100%;
          height: auto;
          margin-top: 0.8rem;
          border-radius: 12px;
          border: 1px solid #1f2937;
        }

        /* ======================
           FEATURES
        ====================== */
        .feature-strip {
          max-width: 1100px;
          margin: 2rem auto 0;

          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .feature h3 {
          margin: 0;
        }

        .feature p {
          color: #9ca3af;
        }

        /* ======================
           FOOTER CTA
        ====================== */
        .closing {
          max-width: 1100px;
          margin: 2rem auto 3rem;
          text-align: center;
        }

        /* ======================
           RESPONSIVE FIX
        ====================== */

        @media (max-width: 900px) {
  .top-actions {
    display: none;
  }
}
  @media (max-width: 900px) {
  .mobile-auth {
    display: flex;
  }
}

@media (max-width: 900px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .brand {
    width: 100%;
    text-align: left;
  }
}

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .visuals {
            grid-template-columns: 1fr;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }

          .top-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </>
  )
}