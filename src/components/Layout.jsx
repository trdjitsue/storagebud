import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchPendingCount()
  }, [profile])

  async function fetchPendingCount() {
    if (!profile) return
    // Count pending requests for groups where user is admin
    const { data: myGroups } = await supabase
      .from('groups').select('id').eq('admin_id', profile.id)
    if (!myGroups?.length) return
    const groupIds = myGroups.map(g => g.id)
    const { count } = await supabase
      .from('join_requests')
      .select('*', { count: 'exact', head: true })
      .in('group_id', groupIds)
      .eq('status', 'pending')
    setPendingCount(count || 0)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || '??'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAV */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
        padding: '0 24px', height: 52, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>
          Storage<span style={{ color: 'var(--green)' }}>Bud</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{profile?.email}</span>
          <div className="avatar" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>
            {initials}
          </div>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </nav>

      {/* TAB BAR */}
      <div style={{
        background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
        padding: '0 24px', display: 'flex', gap: 0
      }}>
        {[
          { to: '/browse', label: 'Browse groups' },
          { to: '/create', label: 'Create group' },
          { to: '/my-group', label: 'My group', badge: pendingCount },
          { to: '/chat', label: 'Chat' },
          ...(profile?.is_admin ? [{ to: '/admin', label: '⭐ Admin' }] : []),
        ].map(tab => (
          <NavLink key={tab.to} to={tab.to} style={({ isActive }) => ({
            padding: '12px 16px', fontSize: 13, textDecoration: 'none', display: 'flex',
            alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            color: isActive ? 'var(--green)' : 'var(--text-3)',
            borderBottom: isActive ? '2px solid var(--green)' : '2px solid transparent',
            fontWeight: isActive ? 500 : 400,
            transition: 'all 0.15s'
          })}>
            {tab.label}
            {tab.badge > 0 && (
              <span style={{
                background: 'var(--red)', color: 'white', fontSize: 9,
                padding: '1px 5px', borderRadius: 10, fontWeight: 600
              }}>{tab.badge}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* PAGE CONTENT */}
      <main style={{ flex: 1, padding: '20px 24px', maxWidth: 800, width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}