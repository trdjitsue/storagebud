import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SIZE_OPTIONS, ITEM_TYPES, VOL_PER_PERSON, getVolColor, calcVolume } from '../lib/constants'

export default function GroupDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myRequest, setMyRequest] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [rent, setRent] = useState(300)

  // Join form state
  const [selSize, setSelSize] = useState(null)
  const [selItems, setSelItems] = useState([])
  const [moveIn, setMoveIn] = useState('')
  const [moveOut, setMoveOut] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { fetchGroup() }, [id, profile])

  async function fetchGroup() {
    const { data } = await supabase
      .from('groups')
      .select(`*, group_members(id, size, items, move_in, move_out, user_id, profiles(display_name))`)
      .eq('id', id).single()
    if (data) {
      setGroup(data)
      setRent(data.rent_sgd || 300)
      setIsMember(data.group_members?.some(m => m.user_id === profile?.id))
    }
    if (profile) {
      const { data: req } = await supabase
        .from('join_requests').select('*')
        .eq('group_id', id).eq('user_id', profile.id).maybeSingle()
      setMyRequest(req)
    }
    setLoading(false)
  }

  async function submitRequest() {
    if (!selSize || selItems.length === 0 || !moveIn || !moveOut) {
      setErr('Please fill in all fields'); return
    }
    setSubmitting(true); setErr('')
    if (group.requires_approval) {
      const { error } = await supabase.from('join_requests').insert({
        group_id: id, user_id: profile.id,
        size: selSize, items: selItems, move_in: moveIn, move_out: moveOut
      })
      if (error) { setErr(error.message); setSubmitting(false); return }
    } else {
      const { error } = await supabase.from('group_members').insert({
        group_id: id, user_id: profile.id,
        size: selSize, items: selItems, move_in: moveIn, move_out: moveOut
      })
      if (error) { setErr(error.message); setSubmitting(false); return }
    }
    setSubmitting(false); setShowModal(false); fetchGroup()
  }

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 40 }}>Loading...</div>
  if (!group) return <div style={{ padding: 40 }}>Group not found.</div>

  const members = group.group_members || []
  const spots = group.max_members - members.length
  const vol = calcVolume(members)
  const maxVol = group.max_members * VOL_PER_PERSON
  const ratio = maxVol > 0 ? vol / maxVol : 0
  const isAdmin = group.admin_id === profile?.id
  const eachPays = Math.round(rent / (members.length + 1))

  return (
    <div>
      <button className="btn-secondary" style={{ fontSize: 12, marginBottom: 16 }} onClick={() => navigate('/browse')}>
        ← Back
      </button>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{group.hall} · {group.room}</div>
          {isAdmin && <span className="badge badge-green">You are admin</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
          {members.length}/{group.max_members} members · {spots} spot{spots !== 1 ? 's' : ''} left
          {group.requires_approval && ' · 🔒 Admin approval required'}
        </div>
        {group.notes && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>{group.notes}</div>}

        {/* Volume */}
        <div className="section-label">Room volume</div>
        <div className="vol-bar-row" style={{ marginBottom: 3 }}>
          {Array.from({ length: maxVol }, (_, i) => (
            <div key={i} className={`vol-bar ${i < vol ? 'filled ' + getVolColor(ratio) : ''}`} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>{vol}/{maxVol} volume units used</div>

        {/* Members */}
        <div className="section-label">Members</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {members.map(m => {
            const sOpt = SIZE_OPTIONS.find(s => s.id === m.size)
            const hue = (m.user_id?.charCodeAt(0) || 0) * 47 % 360
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ background: `hsl(${hue},55%,82%)`, color: `hsl(${hue},55%,30%)` }}>
                  {(m.profiles?.display_name || '?').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.profiles?.display_name || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{(m.items || []).join(', ')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                  {sOpt && <span className="badge badge-green">{sOpt.icon} {sOpt.label}</span>}
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.move_in} – {m.move_out}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Cost calculator */}
        <div className="section-label">Cost calculator</div>
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>Total room rent (SGD/month)</label>
            <input type="number" value={rent} onChange={e => setRent(Number(e.target.value))}
              style={{ width: 90 }} min={0} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
            <span>People (if you join)</span><span>{members.length + 1}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500, color: 'var(--green-dark)' }}>
            <span>Each person pays</span><span>SGD {eachPays}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      {isAdmin ? (
        <button className="btn-primary" style={{ width: '100%', padding: 11 }} onClick={() => navigate('/my-group')}>
          Manage your group →
        </button>
      ) : isMember ? (
        <div style={{ textAlign: 'center', padding: 12, color: 'var(--green-dark)', background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
          You are a member of this group
        </div>
      ) : myRequest ? (
        <div style={{
          textAlign: 'center', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 13,
          background: myRequest.status === 'declined' ? 'var(--red-light)' : 'var(--amber-light)',
          color: myRequest.status === 'declined' ? '#993C1D' : '#854F0B'
        }}>
          {myRequest.status === 'pending' && '⏳ Request sent — waiting for admin approval'}
          {myRequest.status === 'approved' && '✓ Request approved!'}
          {myRequest.status === 'declined' && 'Request declined by admin'}
        </div>
      ) : spots === 0 ? (
        <button className="btn-primary" disabled style={{ width: '100%', padding: 11 }}>Group is full</button>
      ) : (
        <button className="btn-primary" style={{ width: '100%', padding: 11 }} onClick={() => setShowModal(true)}>
          {group.requires_approval ? 'Request to join' : 'Join this group'}
        </button>
      )}

      {/* JOIN MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 360, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
              {group.requires_approval ? 'Request to join' : 'Join group'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
              {group.hall} · {group.room}{group.requires_approval ? ' · admin will review your request' : ''}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="section-label">How much space do you need?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {SIZE_OPTIONS.map(s => (
                  <div key={s.id} onClick={() => setSelSize(s.id)}
                    style={{
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

            <div style={{ marginBottom: 14 }}>
              <div className="section-label">What will you store?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {ITEM_TYPES.map(item => (
                  <span key={item} className={`chip ${selItems.includes(item) ? 'selected' : ''}`}
                    onClick={() => setSelItems(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="section-label">Move-in & move-out dates</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>Drop-off date</div>
                  <input type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>Pick-up date</div>
                  <input type="date" value={moveOut} onChange={e => setMoveOut(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="section-label">Additional notes (optional)</div>
              <textarea placeholder="e.g. My suitcase is large, available to help carry things..." style={{ height: 55 }} />
            </div>

            {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{err}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2 }} disabled={submitting} onClick={submitRequest}>
                {submitting ? 'Sending...' : group.requires_approval ? 'Send request' : 'Join now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}