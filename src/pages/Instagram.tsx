import { Link } from 'react-router-dom';

const styles = {
  // v2 brand palette
  teal: '#5F9D86',
  tealDark: '#4E8571',
  tealLight: '#EDF5F0',
  gold: '#C9973F',
  goldLight: '#FBF7EE',
  cream: '#FAF7F2',
  creamDark: '#EDE8E0',
  text: '#17201E',
  textMuted: '#6B7C78',
  white: '#FFFFFF',
} as const;

// Simple inline SVG icons
const IconBook = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={styles.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const IconBrain = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={styles.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04z" />
  </svg>
);
const IconCards = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={styles.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="13" rx="2" /><path d="M22 5V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2" />
  </svg>
);
const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={styles.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={styles.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Instagram() {
  return (
    <div style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", background: styles.cream, color: styles.text, minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${styles.tealLight} 0%, ${styles.cream} 60%)`, padding: '56px 24px 48px', textAlign: 'center' }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <img
            src="/haven-icons/icon-512x512.png"
            alt="Haven"
            style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}
          />
          <span style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 22, color: styles.text, fontWeight: 600, letterSpacing: '-0.01em' }}>Haven Study</span>
        </div>

        <h1 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(2rem, 8vw, 2.8rem)', fontWeight: 700, lineHeight: 1.2, color: styles.text, marginBottom: 16, maxWidth: 480, margin: '0 auto 16px' }}>
          Pass the Life in the UK Test, First Time
        </h1>
        <p style={{ fontSize: 17, color: styles.textMuted, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 32px' }}>
          Calm, structured study that fits your life. 29 lessons, 560+ practice questions, and AI-powered support.
        </p>
        <Link to="/signup" style={{ display: 'inline-block', background: styles.teal, color: styles.white, padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none', letterSpacing: '0.01em' }}>
          Start Free Today
        </Link>
        <p style={{ fontSize: 13, color: styles.textMuted, marginTop: 12 }}>No credit card required</p>
      </section>

      {/* Stats bar */}
      <section style={{ background: styles.teal, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 480, margin: '0 auto' }}>
          {[
            { value: '29', label: 'Lessons' },
            { value: '560+', label: 'Questions' },
            { value: '570+', label: 'Flashcards' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 26, color: styles.white, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '48px 24px', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, textAlign: 'center', marginBottom: 32, color: styles.text }}>
          Everything you need to prepare
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: <IconBook />, title: 'Guided Lessons', desc: '29 lessons covering every topic on the test syllabus' },
            { icon: <IconBrain />, title: 'Practice Questions', desc: '560+ real-style questions with instant explanations' },
            { icon: <IconCards />, title: 'Flashcards', desc: '570+ cards to reinforce key facts through active recall' },
            { icon: <IconChart />, title: 'Progress Tracking', desc: 'See exactly where you stand and what to study next' },
          ].map(f => (
            <div key={f.title} style={{ background: styles.white, borderRadius: 16, padding: '20px 16px', border: `1px solid ${styles.creamDark}` }}>
              <div style={{ marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: styles.text }}>{f.title}</div>
              <div style={{ fontSize: 13, color: styles.textMuted, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: '0 24px 48px', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, textAlign: 'center', marginBottom: 24, color: styles.text }}>
          5 complete modules
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { num: 1, title: 'The Values and Principles of the UK' },
            { num: 2, title: 'What is the UK?' },
            { num: 3, title: 'A Long and Illustrious History' },
            { num: 4, title: 'A Modern, Thriving Society' },
            { num: 5, title: 'The UK Government, the Law and Your Role' },
          ].map(m => (
            <div key={m.num} style={{ display: 'flex', alignItems: 'center', gap: 14, background: styles.white, borderRadius: 12, padding: '14px 16px', border: `1px solid ${styles.creamDark}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: styles.tealLight, color: styles.teal, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.num}</div>
              <span style={{ fontSize: 14, fontWeight: 500, color: styles.text }}>{m.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section style={{ background: styles.white, padding: '40px 24px', borderTop: `1px solid ${styles.creamDark}`, borderBottom: `1px solid ${styles.creamDark}` }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 24, color: styles.text }}>
            Built to help you pass
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Built around the official Life in the UK test syllabus',
              'Practice questions written in real exam style',
              'Flashcards designed to make hard facts stick',
              'Mock exams that mirror the real test format',
              'Study at your own pace — on any device',
            ].map(point => (
              <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}><IconCheck /></div>
                <span style={{ fontSize: 15, color: styles.textMuted, lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '48px 24px 56px', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, textAlign: 'center', marginBottom: 8, color: styles.text }}>
          Simple, honest pricing
        </h2>
        <p style={{ textAlign: 'center', color: styles.textMuted, fontSize: 15, marginBottom: 28 }}>Start free, upgrade when you're ready</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Free */}
          <div style={{ background: styles.white, borderRadius: 16, padding: '24px', border: `1px solid ${styles.creamDark}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: styles.text }}>Free</div>
                <div style={{ color: styles.textMuted, fontSize: 13, marginTop: 2 }}>Try it free · upgrade for full access</div>
              </div>
              <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 28, color: styles.text, fontWeight: 700 }}>£0</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['2 free modules', '5 flashcards per session', 'Progress tracking'].map(f => (
                <li key={f} style={{ fontSize: 14, color: styles.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: styles.teal, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" style={{ display: 'block', textAlign: 'center', background: styles.tealLight, color: styles.teal, padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Try Free
            </Link>
          </div>

          {/* Plus */}
          <div style={{ background: styles.white, borderRadius: 16, padding: '24px', border: `2px solid ${styles.teal}` }}>
            <div style={{ display: 'inline-block', background: styles.teal, color: styles.white, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>Most Popular</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: styles.text }}>Haven Plus</div>
                <div style={{ color: styles.textMuted, fontSize: 13, marginTop: 2 }}>Full access, monthly</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 28, color: styles.text, fontWeight: 700 }}>£4.99</div>
                <div style={{ fontSize: 12, color: styles.textMuted }}>per month</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['All 29 lessons', '560+ practice questions', '570+ flashcards', '2 mock exams per month', 'Resit support'].map(f => (
                <li key={f} style={{ fontSize: 14, color: styles.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: styles.teal, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/paywall" style={{ display: 'block', textAlign: 'center', background: styles.teal, color: styles.white, padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Get Haven Plus
            </Link>
          </div>

          {/* Premium */}
          <div style={{ background: `linear-gradient(135deg, #17201E 0%, #2A4035 100%)`, borderRadius: 16, padding: '24px' }}>
            <div style={{ display: 'inline-block', background: styles.gold, color: styles.white, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>Best Value</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: styles.white }}>Haven Premium</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>Everything, for 6 months</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 28, color: styles.white, fontWeight: 700 }}>£24.99</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>6 months</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Everything in Plus', 'Pippa AI study assistant', 'Dynamic exams + deep analytics', 'Offline access (PWA)', 'Priority support'].map(f => (
                <li key={f} style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: styles.gold, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/paywall" style={{ display: 'block', textAlign: 'center', background: styles.gold, color: styles.white, padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Get Haven Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(160deg, ${styles.teal} 0%, ${styles.tealDark} 100%)`, padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.6rem, 6vw, 2.2rem)', fontWeight: 700, color: styles.white, marginBottom: 12, lineHeight: 1.2 }}>
          Ready to pass your test?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
          Start with two free modules — no credit card, no commitment.
        </p>
        <Link to="/signup" style={{ display: 'inline-block', background: styles.white, color: styles.teal, padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          Try Haven Free
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 14 }}>Free forever · upgrade anytime</p>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', background: styles.cream, borderTop: `1px solid ${styles.creamDark}` }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <Link to="/privacy" style={{ fontSize: 13, color: styles.textMuted, textDecoration: 'none' }}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: 13, color: styles.textMuted, textDecoration: 'none' }}>Terms</Link>
          <a href="https://www.instagram.com/havenstudy.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: styles.textMuted, textDecoration: 'none' }}>Instagram</a>
        </div>
        <p style={{ fontSize: 12, color: styles.textMuted, margin: 0 }}>© {new Date().getFullYear()} Haven Study · havenstudy.app/uk</p>
      </footer>

    </div>
  );
}
