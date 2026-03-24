import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/browse')
      } else {
        await signUp(email, password, name)
        setMessage('Check your NTU email to confirm your account, then come back to sign in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* LEFT PANEL */}
      <div style={{
        background: '#0F6E56', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 52px'
      }}>
        {/* Logo */}
        <div style={{ fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
          Storage<span style={{ color: '#5DCAA5' }}>Bud</span>
        </div>

        {/* Hero text */}
        <div>
          <div style={{ fontSize: 38, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Don't pay for storage alone.
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 40 }}>
            Find NTU peers to share a room over summer break and split the cost. Easy, safe, and student-only.
          </div>

          {/* Feature pills */}
          {[
            { icon: '🔒', text: 'NTU student emails only' },
            { icon: '💸', text: 'Split costs with up to 10 people' },
            { icon: '📦', text: 'See exactly what fits before joining' },
            { icon: '💬', text: 'Real-time group chat' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0
              }}>{f.icon}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Made for NTU international students
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        background: '#f8f8f6', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 40
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-3)' }}>
              {mode === 'login' ? 'Sign in to find your storage group' : 'Join StorageBud with your NTU email'}
            </div>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
            background: '#ebebea', borderRadius: 8, padding: 4, marginBottom: 24
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
                padding: '9px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-3)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Your name</label>
                <input placeholder="e.g. Ahmad Razif" value={name} onChange={e => setName(e.target.value)} required
                  style={{ padding: '11px 13px', fontSize: 14, borderRadius: 8, border: '1px solid #ddd', background: 'white', width: '100%' }} />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>NTU email</label>
              <input type="email" placeholder="yourname@e.ntu.edu.sg"
                value={email} onChange={e => setEmail(e.target.value)} required
                style={{ padding: '11px 13px', fontSize: 14, borderRadius: 8, border: '1px solid #ddd', background: 'white', width: '100%' }} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Only @e.ntu.edu.sg emails are accepted</div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Password</label>
              <input type="password" placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                style={{ padding: '11px 13px', fontSize: 14, borderRadius: 8, border: '1px solid #ddd', background: 'white', width: '100%' }} />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: '#993C1D', background: '#FAECE7', padding: '10px 12px', borderRadius: 8 }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ fontSize: 12, color: '#0F6E56', background: '#E1F5EE', padding: '10px 12px', borderRadius: 8 }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '13px', fontSize: 14, fontWeight: 600,
              background: loading ? '#aaa' : '#1D9E75', color: 'white',
              border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.15s', width: '100%'
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}