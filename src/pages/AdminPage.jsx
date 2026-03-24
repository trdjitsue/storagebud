import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const TABS = ['overview', 'users', 'groups', 'requests']

export default function AdminPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [banModal, setBanModal] = useState(null) // user to ban
  const [banReason, setBanReason] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/browse')
  }, [profile])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchStats(), fetchUsers(), fetchGroups(), fetchRequests()])
    setLoading(false)
  }

  async function fetchStats() {
    const [{ count: userCount }, { count: groupCount }, { count: memberCount }, { count: reqCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('group_members').select('*', { count: 'exact', head: true }),
      supabase.from('join_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    setStats({ userCount, groupCount, memberCount, reqCount })
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
  }

  async function fetchGroups() {
    const { data } = await supabase
      .from('groups')
      .select('*, group_members(id), profiles(display_name, email)')
      .order('created_at', { ascending: false })
    setGroups(data || [])
  }

  async function fetchRequests() {
    const { data } = await supabase
      .from('join_requests')
      .select('*, profiles(display_name, email), groups(hall, room)')
      .order('created_at', { ascending: false })
      .limit(50)
    setRequests(data || [])
  }

  async function banUser(userId, reason) {
    await supabase.from('profiles').update({
      is_banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString()
    }).eq('id', userId)
    setBanModal(null); setBanReason('')
    setActionMsg('User banned.')
    fetchUsers()
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function unbanUser(userId) {
    await supabase.from('profiles').update({
      is_banned: false, ban_reason: null, banned_at: null
    }).eq('id', userId)
    setActionMsg('User unbanned.')
    fetchUsers()
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function deleteGroup(groupId) {
    if (!confirm('Delete this group? This cannot be undone.')) return
    await supabase.from('groups').delete().eq('id', groupId)
    setActionMsg('Group deleted.')
    fetchGroups(); fetchStats()
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function toggleAdmin(userId, current) {
    if (!confirm(current ? 'Remove admin from this user?' : 'Make this user an admin?')) return
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
    setActionMsg(current ? 'Admin removed.' : 'Admin granted.')
    fetchUsers()
    setTimeout(() => setActionMsg(''), 3000)
  }

  if (!profile?.is_admin) return null
  if (loading) return <div style={{ padding: 40, color: 'var(--text-3)' }}>Loading admin panel...</div>

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredGroups = groups.filter(g =>
    g.hall?.toLowerCase().includes(search.toLowerCase()) ||
    g.room?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>⭐ Admin Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Full platform control</div>
        </div>
        {actionMsg && (
          <div style={{ fontSize: 12, background: 'var(--green-light)', color: 'var(--green-dark)', padding: '7px 14px', borderRadius: 8 }}>
            {actionMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface-2)', padding: 4, borderRadius: 8, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none',
            background: tab === t ? 'var(--surface)' : 'transparent',
            color: tab === t ? 'var(--text)' : 'var(--text-3)',
            cursor: 'pointer', textTransform: 'capitalize',
            boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}>
            {t}
            {t === 'requests' && stats.reqCount > 0 && (
              <span style={{ marginLeft: 5, background: 'var(--red)', color: 'white', fontSize: 9, padding: '1px 5px', borderRadius: 10 }}>
                {stats.reqCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Total users', value: stats.userCount || 0, color: '#1D9E75' },
              { label: 'Total groups', value: stats.groupCount || 0, color: '#7F77DD' },
              { label: 'Group members', value: stats.memberCount || 0, color: '#EF9F27' },
              { label: 'Pending requests', value: stats.reqCount || 0, color: '#E24B4A' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Recent users */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Recent signups</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.slice(0, 5).map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                    {(u.display_name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{u.display_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>
                  {u.is_banned && <span className="badge badge-red">Banned</span>}
                  {u.is_admin && <span className="badge badge-green">Admin</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Recent groups */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Recent groups</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {groups.slice(0, 5).map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{g.hall} · {g.room}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>by {g.profiles?.display_name} · {g.group_members?.length || 0}/{g.max_members} members</div>
                  </div>
                  <button className="btn-danger" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => deleteGroup(g.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
              {filteredUsers.length} users
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)' }}>
                  {['User', 'Email', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: 9, background: 'var(--green-light)', color: 'var(--green-dark)', flexShrink: 0 }}>
                          {(u.display_name || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.display_name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{u.email}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-3)', fontSize: 11 }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.is_admin && <span className="badge badge-green">Admin</span>}
                        {u.is_banned && <span className="badge badge-red" title={u.ban_reason}>Banned</span>}
                        {!u.is_admin && !u.is_banned && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Active</span>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {u.id !== profile.id && (
                          <>
                            {u.is_banned ? (
                              <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => unbanUser(u.id)}>
                                Unban
                              </button>
                            ) : (
                              <button className="btn-danger" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setBanModal(u); setBanReason('') }}>
                                Ban
                              </button>
                            )}
                            <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => toggleAdmin(u.id, u.is_admin)}>
                              {u.is_admin ? 'Remove admin' : 'Make admin'}
                            </button>
                          </>
                        )}
                        {u.id === profile.id && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>You</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GROUPS */}
      {tab === 'groups' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <input placeholder="Search by hall or room..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
              {filteredGroups.length} groups
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)' }}>
                  {['Group', 'Admin', 'Members', 'Approval', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((g, i) => (
                  <tr key={g.id} style={{ borderBottom: i < filteredGroups.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{g.hall}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{g.room}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>{g.profiles?.display_name || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontWeight: 500 }}>{g.group_members?.length || 0}</span>
                      <span style={{ color: 'var(--text-3)' }}>/{g.max_members}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {g.requires_approval
                        ? <span className="badge badge-amber">Required</span>
                        : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Open</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-3)', fontSize: 11 }}>
                      {new Date(g.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => navigate(`/browse/${g.id}`)}>
                          View
                        </button>
                        <button className="btn-danger" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => deleteGroup(g.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUESTS */}
      {tab === 'requests' && (
        <div>
          <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-2)' }}>
            All join requests across the platform
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)' }}>
                  {['User', 'Group', 'Items', 'Dates', 'Status', 'Requested'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < requests.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{r.profiles?.display_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.profiles?.email}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>
                      {r.groups?.hall}<br />
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.groups?.room}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-2)' }}>
                      {(r.items || []).join(', ')}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-3)' }}>
                      {r.move_in} –<br />{r.move_out}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'declined' ? 'badge-red' : 'badge-amber'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-3)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BAN MODAL */}
      {banModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16
        }} onClick={e => e.target === e.currentTarget && setBanModal(null)}>
          <div className="card" style={{ width: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Ban user</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
              {banModal.display_name} · {banModal.email}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Reason for ban</label>
              <textarea
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="e.g. Spam, inappropriate content, fake account..."
                style={{ height: 70 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setBanModal(null)}>Cancel</button>
              <button style={{
                flex: 2, padding: '9px', background: '#E24B4A', color: 'white',
                border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }} onClick={() => banUser(banModal.id, banReason)}>
                Confirm ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}