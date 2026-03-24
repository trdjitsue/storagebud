import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SIZE_OPTIONS } from '../lib/constants'

export default function MyGroupPage() {
  const { profile } = useAuth()
  const [group, setGroup] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMyGroup() }, [profile])

  async function fetchMyGroup() {
    if (!profile) return
    const { data: g } = await supabase
      .from('groups')
      .select(`*, group_members(id, size, items, move_in, move_out, user_id, profiles(display_name))`)
      .eq('admin_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle()

    setGroup(g)
    if (g) {
      const { data: reqs } = await supabase
        .from('join_requests')
        .select(`*, profiles(display_name, email)`)
        .eq('group_id', g.id)
        .order('created_at', { ascending: true })
      setRequests(reqs || [])
    }
    setLoading(false)
  }

  async function handleRequest(reqId, status, userId, req) {
    await supabase.from('join_requests').update({ status }).eq('id', reqId)
    if (status === 'approved') {
      await supabase.from('group_members').insert({
        group_id: group.id, user_id: userId,
        size: req.size, items: req.items, move_in: req.move_in, move_out: req.move_out
      })
    }
    fetchMyGroup()
  }

  async function removeMember(memberId) {
    if (!confirm('Remove this member from the group?')) return
    await supabase.from('group_members').delete().eq('id', memberId)
    fetchMyGroup()
  }

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 40 }}>Loading...</div>

  if (!group) return (
    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
      You haven't created a group yet.<br />
      <a href="/create" style={{ color: 'var(--green)', marginTop: 8, display: 'inline-block' }}>
        Create one →
      </a>
    </div>
  )

  const members = group.group_members || []
  const pending = requests.filter(r => r.status === 'pending')
  const reviewed = requests.filter(r => r.status !== 'pending')

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        My group — {group.hall} · {group.room}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
        You are the admin · {members.length}/{group.max_members} members
      </div>

      {/* Admin info banner */}
      <div style={{
        background: 'var(--green-light)', border: '0.5px solid var(--green-mid)',
        borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 14,
        fontSize: 12, color: 'var(--green-dark)', display: 'flex', gap: 8, alignItems: 'center'
      }}>
        ⭐ You control who joins this group. Approve or decline requests below.
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>
            Pending requests ({pending.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(req => {
              const sOpt = SIZE_OPTIONS.find(s => s.id === req.size)
              return (
                <div key={req.id} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                      {(req.profiles?.display_name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{req.profiles?.display_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{req.profiles?.email}</div>
                    </div>
                    {sOpt && <span className="badge badge-green">{sOpt.icon} {sOpt.label}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>
                    Storing: {(req.items || []).join(', ')} · {req.move_in} – {req.move_out}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '6px' }}
                      onClick={() => handleRequest(req.id, 'approved', req.user_id, req)}>
                      Approve
                    </button>
                    <button className="btn-danger" style={{ flex: 1, fontSize: 12, padding: '6px' }}
                      onClick={() => handleRequest(req.id, 'declined', req.user_id, req)}>
                      Decline
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Current members */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label" style={{ marginBottom: 10 }}>Current members</div>
        {members.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No members yet (just you as admin)</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map(m => {
              const sOpt = SIZE_OPTIONS.find(s => s.id === m.size)
              const isYou = m.user_id === profile?.id
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
                  <div className="avatar" style={{ background: 'var(--green-light)', color: 'var(--green-dark)', width: 28, height: 28, fontSize: 10 }}>
                    {(m.profiles?.display_name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {m.profiles?.display_name} {isYou && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{(m.items || []).join(', ')} · {m.move_in} – {m.move_out}</div>
                  </div>
                  {sOpt && <span className="badge badge-green">{sOpt.icon} {sOpt.label}</span>}
                  {!isYou && (
                    <button className="btn-danger" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => removeMember(m.id)}>
                      Remove
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reviewed requests */}
      {reviewed.length > 0 && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: 10 }}>Past requests</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {reviewed.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ flex: 1, color: 'var(--text-2)' }}>{req.profiles?.display_name}</span>
                <span className={`badge ${req.status === 'approved' ? 'badge-green' : 'badge-red'}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
