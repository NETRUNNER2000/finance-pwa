import Head from 'next/head'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Budget Atlas | Understand Every Rand</title>
        <meta
          name="description"
          content="Track income and expenses, see category flows, and understand 12-month trends in one personal finance workspace."
        />
      </Head>

      <main className="landing-root">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar">
          <div className="brand">Budget Atlas</div>
          <nav className="top-actions">
            <Link href="/login" className="btn btn-ghost">Log In</Link>
            <Link href="/register" className="btn btn-solid">Sign Up</Link>
          </nav>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">Personal Finance, Visualized</p>
            <h1>See where your money comes from, where it goes, and what changes month to month.</h1>
            <p className="hero-copy">
              Budget Atlas turns your transactions into clear visuals: category flow maps, 12-month trend lines,
              and date-range filtering so you can actually understand your spending behavior.
            </p>
            <div className="cta-row">
              <Link href="/register" className="btn btn-solid">Create Free Account</Link>
              <Link href="/login" className="btn btn-ghost">I Already Have an Account</Link>
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

        <section className="visuals">
          <article className="panel">
            <h2>Category Flow View</h2>
            <p>
              Instantly identify your biggest spending streams with flow-style category totals that separate
              income and expenses.
            </p>
            <svg viewBox="0 0 520 220" className="chart-svg" role="img" aria-label="Category flow chart preview">
              <rect x="20" y="40" width="120" height="28" rx="8" fill="#1f6feb" />
              <rect x="20" y="92" width="120" height="28" rx="8" fill="#2ea043" />
              <rect x="20" y="144" width="120" height="28" rx="8" fill="#d29922" />

              <rect x="380" y="56" width="120" height="36" rx="8" fill="#f85149" />
              <rect x="380" y="118" width="120" height="36" rx="8" fill="#8b949e" />

              <path d="M140 54 C 220 54, 280 74, 380 74" stroke="#6ea8fe" strokeWidth="14" fill="none" opacity="0.6" />
              <path d="M140 106 C 230 106, 290 74, 380 74" stroke="#56d364" strokeWidth="14" fill="none" opacity="0.6" />
              <path d="M140 158 C 220 158, 290 136, 380 136" stroke="#e3b341" strokeWidth="14" fill="none" opacity="0.6" />

              <text x="24" y="58" fill="#fff" fontSize="12">Salary</text>
              <text x="24" y="110" fill="#fff" fontSize="12">Freelance</text>
              <text x="24" y="162" fill="#111" fontSize="12">Interest</text>

              <text x="394" y="78" fill="#fff" fontSize="12">Living Costs</text>
              <text x="394" y="140" fill="#fff" fontSize="12">Savings</text>
            </svg>
          </article>

          <article className="panel">
            <h2>12-Month Trend Line</h2>
            <p>
              Track trajectory over time with month-by-month trends so you can spot spikes, seasonality,
              and progress.
            </p>
            <svg viewBox="0 0 520 220" className="chart-svg" role="img" aria-label="Line chart preview">
              <line x1="40" y1="180" x2="480" y2="180" stroke="#94a3b8" strokeWidth="1" />
              <line x1="40" y1="30" x2="40" y2="180" stroke="#94a3b8" strokeWidth="1" />

              <polyline
                points="40,150 80,136 120,128 160,133 200,115 240,108 280,94 320,102 360,84 400,76 440,68 480,60"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
              />
              <polyline
                points="40,164 80,158 120,150 160,146 200,140 240,132 280,126 320,124 360,118 400,112 440,108 480,102"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="4"
              />

              <text x="46" y="198" fill="#475569" fontSize="11">Jan</text>
              <text x="192" y="198" fill="#475569" fontSize="11">May</text>
              <text x="334" y="198" fill="#475569" fontSize="11">Sep</text>
              <text x="456" y="198" fill="#475569" fontSize="11">Dec</text>
            </svg>
          </article>
        </section>

        <section className="feature-strip">
          <div className="feature">
            <h3>Fast Filtering</h3>
            <p>Adjust date ranges and instantly compare outcomes without losing context.</p>
          </div>
          <div className="feature">
            <h3>Shared Accounts</h3>
            <p>Switch between shared account views and keep household finances aligned.</p>
          </div>
          <div className="feature">
            <h3>Actionable Clarity</h3>
            <p>From raw transactions to patterns you can act on in a few clicks.</p>
          </div>
        </section>

        <section className="closing">
          <h2>Start seeing your finances clearly.</h2>
          <p>Sign up in under a minute, add transactions, and get instant visual insight.</p>
          <div className="cta-row center">
            <Link href="/register" className="btn btn-solid">Sign Up</Link>
            <Link href="/login" className="btn btn-ghost">Log In</Link>
          </div>
        </section>
      </main>

      <style jsx>{`
        .landing-root {
          --bg: #0f141a;
          --ink: #eaf1f7;
          --muted: #9eb0c0;
          --card: rgba(19, 27, 35, 0.8);
          --stroke: rgba(182, 204, 224, 0.2);
          --accent: #ff7b39;
          --accent-dark: #ffb284;
          min-height: 100vh;
          color: var(--ink);
          background:
            radial-gradient(circle at 10% 20%, rgba(243, 184, 125, 0.45), transparent 40%),
            radial-gradient(circle at 92% 78%, rgba(107, 164, 200, 0.28), transparent 38%),
            var(--bg);
          padding: 1.5rem;
          font-family: "Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif;
          position: relative;
          overflow: hidden;
        }

        .ambient {
          position: absolute;
          border-radius: 999px;
          filter: blur(42px);
          opacity: 0.38;
          pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }

        .ambient-a {
          width: 260px;
          height: 260px;
          background: #ff9b5a;
          left: -70px;
          top: 120px;
        }

        .ambient-b {
          width: 240px;
          height: 240px;
          background: #4ca7d8;
          right: -50px;
          bottom: 120px;
          animation-delay: 1.5s;
        }

        .topbar {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .brand {
          letter-spacing: 0.06em;
          font-weight: 800;
          font-size: 1.1rem;
          text-transform: uppercase;
        }

        .top-actions {
          display: flex;
          gap: 0.75rem;
        }

        .hero {
          max-width: 1120px;
          margin: 2.2rem auto 0;
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: stretch;
          position: relative;
          z-index: 2;
          animation: rise 550ms ease-out;
        }

        .eyebrow {
          color: var(--accent-dark);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          font-size: 0.78rem;
          margin: 0 0 0.6rem;
        }

        h1 {
          font-family: "Rockwell", "Palatino Linotype", serif;
          font-size: clamp(2rem, 4.8vw, 3.6rem);
          line-height: 1.05;
          margin: 0;
          max-width: 16ch;
        }

        .hero-copy {
          margin-top: 1rem;
          max-width: 56ch;
          color: var(--muted);
          font-size: 1.03rem;
          line-height: 1.65;
        }

        .cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.4rem;
        }

        .cta-row.center {
          justify-content: center;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.72rem 1.05rem;
          border-radius: 999px;
          text-decoration: none;
          border: 1px solid transparent;
          transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
          font-weight: 700;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn-solid {
          background: var(--accent);
          color: #101418;
          box-shadow: 0 7px 16px rgba(255, 123, 57, 0.35);
        }

        .btn-solid:hover {
          background: #ff8f58;
        }

        .btn-ghost {
          border-color: var(--stroke);
          background: rgba(23, 33, 43, 0.72);
          color: var(--ink);
          backdrop-filter: blur(6px);
        }

        .hero-card,
        .panel,
        .feature,
        .closing {
          background: var(--card);
          border: 1px solid var(--stroke);
          backdrop-filter: blur(6px);
        }

        .hero-card {
          border-radius: 18px;
          padding: 1.2rem;
          animation: rise 700ms ease-out;
        }

        .hero-card h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .hero-card p {
          margin: 0.45rem 0 1rem;
          color: var(--muted);
        }

        .mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        .stat {
          padding: 0.7rem;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: rgba(15, 21, 28, 0.7);
        }

        .stat.full {
          grid-column: 1 / -1;
        }

        .stat span {
          color: var(--muted);
          display: block;
          font-size: 0.86rem;
        }

        .stat strong {
          font-size: 1.1rem;
        }

        .visuals {
          max-width: 1120px;
          margin: 1.7rem auto 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr 1fr;
          position: relative;
          z-index: 2;
        }

        .panel {
          border-radius: 18px;
          padding: 1.1rem;
          animation: rise 850ms ease-out;
        }

        .panel h2 {
          margin: 0;
          font-size: 1.2rem;
        }

        .panel p {
          color: var(--muted);
          margin-top: 0.5rem;
          margin-bottom: 0.9rem;
        }

        .chart-svg {
          width: 100%;
          height: auto;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: rgba(15, 21, 28, 0.76);
        }

        .feature-strip {
          max-width: 1120px;
          margin: 1rem auto 0;
          display: grid;
          gap: 0.8rem;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          position: relative;
          z-index: 2;
        }

        .feature {
          border-radius: 14px;
          padding: 1rem;
          animation: rise 1s ease-out;
        }

        .feature h3 {
          margin: 0;
        }

        .feature p {
          margin: 0.45rem 0 0;
          color: var(--muted);
        }

        .closing {
          max-width: 1120px;
          margin: 1rem auto 2.2rem;
          border-radius: 18px;
          padding: 1.35rem;
          text-align: center;
          position: relative;
          z-index: 2;
          animation: rise 1.1s ease-out;
        }

        .closing h2 {
          margin: 0;
          font-size: clamp(1.4rem, 3.5vw, 2.2rem);
          font-family: "Rockwell", "Palatino Linotype", serif;
        }

        .closing p {
          color: var(--muted);
          margin-top: 0.6rem;
        }

        @media (max-width: 960px) {
          .hero,
          .visuals {
            grid-template-columns: 1fr;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes drift {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(10px, -8px, 0) scale(1.08);
          }
        }
      `}</style>
    </>
  )
}
