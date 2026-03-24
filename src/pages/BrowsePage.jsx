import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import GroupCard from '../components/GroupCard'
import { HALLS } from '../lib/constants'

export default function BrowsePage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [hallFilter, setHallFilter] = useState('')

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    setLoading(true)
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members (
          id, size, items, move_in, move_out, user_id,
          profiles (display_name)
        )
      `)
      .order('created_at', { ascending: false })

    if (!error) setGroups(data || [])
    setLoading(false)
  }

  const filtered = hallFilter ? groups.filter(g => g.hall === hallFilter) : groups
  const openGroups = filtered.filter(g => (g.group_members?.length || 0) < g.max_members)
  const fullGroups = filtered.filter(g => (g.group_members?.length || 0) >= g.max_members)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Find a storage group</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Browse groups looking for members this summer</div>
      </div>

      {/* Hall filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          className={hallFilter === '' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: 12, padding: '5px 12px' }}
          onClick={() => setHallFilter('')}>
          All halls
        </button>
        {HALLS.map(h => (
          <button key={h}
            className={hallFilter === h ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setHallFilter(h)}>
            {h}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 40 }}>Loading groups...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
          No groups found. <a href="/create" style={{ color: 'var(--green)' }}>Create the first one!</a>
        </div>
      ) : (
        <>
          {openGroups.length > 0 && (
            <>
              <div className="section-label" style={{ marginBottom: 8 }}>Open ({openGroups.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {openGroups.map(g => <GroupCard key={g.id} group={g} />)}
              </div>
            </>
          )}
          {fullGroups.length > 0 && (
            <>
              <div className="section-label" style={{ marginBottom: 8 }}>Full ({fullGroups.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, opacity: 0.6 }}>
                {fullGroups.map(g => <GroupCard key={g.id} group={g} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
