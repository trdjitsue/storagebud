import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { HALLS, ITEM_TYPES, SIZE_OPTIONS } from '../lib/constants'

export default function CreateGroupPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [hall, setHall] = useState('')
  const [room, setRoom] = useState('')
  const [maxMembers, setMaxMembers] = useState(4)
  const [requiresApproval, setRequiresApproval] = useState(true)
  const [rentSgd, setRentSgd] = useState(300)
  const [storageStart, setStorageStart] = useState('')
  const [storageEnd, setStorageEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [selSize, setSelSize] = useState(null)
  const [selItems, setSelItems] = useState([])
  const [moveIn, setMoveIn] = useState('')
  const [moveOut, setMoveOut] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!hall || !room || !selSize || selItems.length === 0 || !moveIn || !moveOut) {
      setErr('Please fill in all required fields'); return
    }
    setLoading(true); setErr('')
    const { data: group, error } = await supabase.from('groups').insert({
      hall, room, max_members: maxMembers, admin_id: profile.id,
      requires_approval: requiresApproval, rent_sgd: rentSgd,
      storage_start: storageStart || null, storage_end: storageEnd || null, notes
    }).select().single()

    if (error) { setErr(error.message); setLoading(false); return }

    // Add creator as first member
    await supabase.from('group_members').insert({
      group_id: group.id, user_id: profile.id,
      size: selSize, items: selItems, move_in: moveIn, move_out: moveOut
    })

    navigate(`/browse/${group.id}`)
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Create a group</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
        You'll be the admin — you control who joins
      </div>

      <form onSubmit={handleCreate}>
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Group details</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Hall *</label>
            <select value={hall} onChange={e => setHall(e.target.value)} required>
              <option value="">Select a hall...</option>
              {HALLS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Room number *</label>
            <input placeholder="e.g. Room 204" value={room} onChange={e => setRoom(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Max members</label>
              <select value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))}>
                {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} people</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Room rent (SGD/mo)</label>
              <input type="number" value={rentSgd} onChange={e => setRentSgd(Number(e.target.value))} min={0} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Storage from</label>
              <input type="date" value={storageStart} onChange={e => setStorageStart(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Storage until</label>
              <input type="date" value={storageEnd} onChange={e => setStorageEnd(e.target.value)} />
            </div>
          </div>

          {/* Approval toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Require approval to join</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>You review and approve each join request</div>
            </div>
            <div onClick={() => setRequiresApproval(p => !p)} style={{
              width: 38, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative',
              background: requiresApproval ? 'var(--green)' : 'var(--border-2)',
              transition: 'background 0.2s', flexShrink: 0
            }}>
              <div style={{
                position: 'absolute', width: 16, height: 16, borderRadius: '50%',
                background: 'white', top: 3,
                left: requiresApproval ? 19 : 3, transition: 'left 0.2s'
              }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
            <textarea placeholder="e.g. Prefer near North Spine, flexible on dates..." value={notes} onChange={e => setNotes(e.target.value)} style={{ height: 60 }} />
          </div>
        </div>

        {/* YOUR OWN ITEMS */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Your storage details</div>

          <div style={{ marginBottom: 12 }}>
            <div className="section-label">How much space do you need? *</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SIZE_OPTIONS.map(s => (
                <div key={s.id} onClick={() => setSelSize(s.id)} style={{
                  border: selSize === s.id ? '1.5px solid var(--green)' : '0.5px solid var(--border-2)',
                  borderRadius: 'var(--radius-sm)', padding: '8px 10px', cursor: 'pointer',
                  background: selSize === s.id ? 'var(--green-light)' : 'var(--surface)',
                  transition: 'all 0.15s'
                }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="section-label">What will you store? *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {ITEM_TYPES.map(item => (
                <span key={item} className={`chip ${selItems.includes(item) ? 'selected' : ''}`}
                  onClick={() => setSelItems(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Your drop-off date *</label>
              <input type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Your pick-up date *</label>
              <input type="date" value={moveOut} onChange={e => setMoveOut(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Additional notes (optional)</label>
            <textarea
              placeholder="e.g. My suitcase is quite large, I can help carry boxes up stairs..."
              style={{ height: 60 }}
            />
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{err}</div>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: 11, fontSize: 14 }}>
          {loading ? 'Creating...' : 'Create group'}
        </button>
      </form>
    </div>
  )
}