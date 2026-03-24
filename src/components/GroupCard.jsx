import { useNavigate } from 'react-router-dom'
import { SIZE_OPTIONS, VOL_PER_PERSON, getVolColor, calcVolume } from '../lib/constants'

export default function GroupCard({ group }) {
  const navigate = useNavigate()
  const members = group.group_members || []
  const spots = group.max_members - members.length
  const vol = calcVolume(members)
  const maxVol = group.max_members * VOL_PER_PERSON
  const ratio = maxVol > 0 ? vol / maxVol : 0
  const volColor = getVolColor(ratio)

  const badge = spots === 0
    ? { text: 'Full', cls: 'badge-red' }
    : spots === 1
    ? { text: '1 spot left', cls: 'badge-amber' }
    : { text: 'Open', cls: 'badge-green' }

  const allItems = [...new Set(members.flatMap(m => m.items || []))].slice(0, 5)

  return (
    <div className="card" onClick={() => navigate(`/browse/${group.id}`)}
      style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = ''}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{group.hall}</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {group.requires_approval && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>🔒</span>}
          <span className={`badge ${badge.cls}`}>{badge.text}</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
        {group.room} · {members.length}/{group.max_members} members
      </div>

      {allItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
          {allItems.map(item => (
            <span key={item} style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              background: 'var(--surface-2)', color: 'var(--text-2)'
            }}>{item}</span>
          ))}
        </div>
      )}

      {/* Volume bar */}
      <div className="vol-bar-row" style={{ marginBottom: 3 }}>
        {Array.from({ length: maxVol }, (_, i) => (
          <div key={i} className={`vol-bar ${i < vol ? 'filled ' + volColor : ''}`} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
        Volume: {vol}/{maxVol} units
      </div>

      {/* Member avatars */}
      {members.length > 0 && (
        <div style={{ display: 'flex', marginTop: 8 }}>
          {members.slice(0, 4).map((m, i) => (
            <div key={m.id} className="avatar" style={{
              width: 22, height: 22, fontSize: 8, marginLeft: i > 0 ? -6 : 0,
              border: '1.5px solid var(--surface)',
              background: `hsl(${(m.user_id?.charCodeAt(0) || 0) * 47 % 360}, 55%, 82%)`,
              color: `hsl(${(m.user_id?.charCodeAt(0) || 0) * 47 % 360}, 55%, 30%)`
            }}>
              {(m.profiles?.display_name || '?').slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
