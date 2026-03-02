import { Link } from 'react-router-dom';

const styles = {
  // Colours
  sage: '#7B9E87',
  sageDark: '#5A7E65',
  sageLight: '#F0F5F1',
  gold: '#C8A96E',
  goldLight: '#FBF7EE',
  cream: '#FBF8F3',
  creamDark: '#F0EBE1',
  text: '#2D3330',
  textMuted: '#6B7A6E',
  white: '#FFFFFF',
} as const;

export default function Instagram() {
  return (
    <div style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", background: styles.cream, color: styles.text, minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${styles.sageLight} 0%, ${styles.cream} 60%)`, padding: '56px 24px 48px', textAlign: 'center' }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: styles.sage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 22, color: styles.text, fontWeight: 400, letterSpacing: '-0.01em' }}>Haven Study</span>
        </div>

        <h1 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(2rem, 8vw, 2.8rem)', fontWeight: 400, lineHeight: 1.2, color: styles.text, marginBottom: 16, maxWidth: 480, margin: '0 auto 16px' }}>
          Pass the Life in the UK Test — First Time
        </h1>
        <p style={{ fontSize: 17, color: styles.textMuted, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 32px' }}>
          Calm, structured study that fits your life. 29 lessons, 590+ practice questions, and AI-powered support.
        </p>
        <Link to="/signup" style={{ display: 'inline-block', background: styles.sage, color: styles.white, padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none', letterSpacing: '0.01em' }}>
          Start Free Today
        </Link>
        <p style={{ fontSize: 13, color: styles.textMuted, marginTop: 12 }}>No credit card required</p>
      </section>

      {/* Stats bar */}
      <section style={{ background: styles.sage, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 480, margin: '0 auto' }}>
          {[
            { value: '29', label: 'Lessons' },
            { value: '590+', label: 'Questions' },
            { value: '610+', label: 'Flashcards' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 26, color: styles.white, fontWeight: 400 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '48px 24px', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 400, textAlign: 'center', marginBottom: 32, color: styles.text }}>
          Everything you need to prepare
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '📖', title: 'Guided Lessons', desc: '29 lessons covering every chapter of the official handbook' },
            { icon: '✏️', title: 'Practice Questions', desc: '590+ real-style questions with instant explanations' },
            { icon: '🃏', title: 'Flashcards', desc: '610+ cards to reinforce key facts through active recall' },
            { icon: '📊', title: 'Progress Tracking', desc: 'See exactly where you stand and what to study next' },
          ].map(f => (
            <div key={f.title} style={{ background: styles.white, borderRadius: 16, padding: '20px 16px', border: `1px solid ${styles.creamDark}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: styles.text }}>{f.title}</div>
              <div style={{ fontSize: 13, color: styles.textMuted, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section style={{ padding: '0 24px 48px', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 400, textAlign: 'center', marginBottom: 24, color: styles.text }}>
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
              <div style={{ width: 32, height: 32, borderRadius: 8, background: styles.sageLight, color: styles.sage, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.num}</div>
              <span style={{ fontSize: 14, fontWeight: 500, color: styles.text }}>{m.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '0 24px 56px', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 400, textAlign: 'center', marginBottom: 8, color: styles.text }}>
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
              <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 28, color: styles.text }}>£0</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['2 free modules', '5 flashcards per session', 'Progress tracking'].map(f => (
                <li key={f} style={{ fontSize: 14, color: styles.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: styles.sage, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" style={{ display: 'block', textAlign: 'center', background: styles.sageLight, color: styles.sage, padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Try Free
            </Link>
          </div>

          {/* Plus */}
          <div style={{ background: styles.white, borderRadius: 16, padding: '24px', border: `2px solid ${styles.sage}` }}>
            <div style={{ display: 'inline-block', background: styles.sage, color: styles.white, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>Most Popular</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: styles.text }}>Haven Plus</div>
                <div style={{ color: styles.textMuted, fontSize: 13, marginTop: 2 }}>Full access, monthly</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 28, color: styles.text }}>£4.99</div>
                <div style={{ fontSize: 12, color: styles.textMuted }}>per month</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['All 29 lessons', '500+ practice questions', '2 mock exams per month', 'Resit support'].map(f => (
                <li key={f} style={{ fontSize: 14, color: styles.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: styles.sage, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/paywall" style={{ display: 'block', textAlign: 'center', background: styles.sage, color: styles.white, padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Get Haven Plus
            </Link>
          </div>

          {/* Premium */}
          <div style={{ background: `linear-gradient(135deg, #2D3330 0%, #3A5241 100%)`, borderRadius: 16, padding: '24px' }}>
            <div style={{ display: 'inline-block', background: styles.gold, color: styles.white, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>Best Value</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: styles.white }}>Haven Premium</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>Everything, for 6 months</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 28, color: styles.white }}>£24.99</div>
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

      {/* Testimonial / trust signals */}
      <section style={{ background: styles.white, padding: '40px 24px', borderTop: `1px solid ${styles.creamDark}`, borderBottom: `1px solid ${styles.creamDark}` }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <blockquote style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: styles.text, fontWeight: 400, lineHeight: 1.4, margin: '0 0 16px', fontStyle: 'italic' }}>
            "I passed first time after studying with Haven for just three weeks. The lessons are clear and the practice questions really prepared me."
          </blockquote>
          <div style={{ fontSize: 13, color: styles.textMuted, fontWeight: 600 }}>Priya S. — Passed October 2025</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: styles.gold, fontSize: 16 }}>★</span>)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(160deg, ${styles.sage} 0%, ${styles.sageDark} 100%)`, padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Montserrat', Georgia, serif", fontSize: 'clamp(1.6rem, 6vw, 2.2rem)', fontWeight: 400, color: styles.white, marginBottom: 12, lineHeight: 1.2 }}>
          Ready to pass your test?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
          Join thousands of people who've passed the Life in the UK test with Haven.
        </p>
        <Link to="/signup" style={{ display: 'inline-block', background: styles.white, color: styles.sage, padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
          Try Haven Free
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 14 }}>Try free · No credit card required</p>
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
