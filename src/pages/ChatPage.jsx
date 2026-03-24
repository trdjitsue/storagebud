import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ChatPage() {
  const { groupId } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [myGroups, setMyGroups] = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => { fetchMyGroups() }, [profile])

  useEffect(() => {
    if (!activeGroup) return
    fetchMessages(activeGroup.group_id)
    // Realtime subscription
    const channel = supabase
      .channel(`chat:${activeGroup.group_id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${activeGroup.group_id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeGroup])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMyGroups() {
    if (!profile) return
    // Groups where user is a member
    const { data: memberOf } = await supabase
      .from('group_members')
      .select('group_id, groups(id, hall, room)')
      .eq('user_id', profile.id)
    // Groups where user is admin
    const { data: adminOf } = await supabase
      .from('groups')
      .select('id, hall, room')
      .eq('admin_id', profile.id)

    const memberGroups = (memberOf || []).map(m => ({ group_id: m.group_id, hall: m.groups.hall, room: m.groups.room }))
    const adminGroups = (adminOf || []).map(g => ({ group_id: g.id, hall: g.hall, room: g.room }))

    // Merge, deduplicate
    const seen = new Set()
    const all = [...memberGroups, ...adminGroups].filter(g => {
      if (seen.has(g.group_id)) return false
      seen.add(g.group_id); return true
    })

    setMyGroups(all)
    // Auto-select from URL param or first group
    const target = groupId ? all.find(g => g.group_id === groupId) : all[0]
    if (target) setActiveGroup(target)
    setLoading(false)
  }

  async function fetchMessages(gid) {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(display_name)')
      .eq('group_id', gid)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!text.trim() || !activeGroup) return
    const content = text.trim()
    setText('')
    await supabase.from('messages').insert({
      group_id: activeGroup.group_id,
      user_id: profile.id,
      content
    })
  }

  function selectGroup(g) {
    setActiveGroup(g)
    navigate(`/chat/${g.group_id}`, { replace: true })
  }

  function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 40 }}>Loading...</div>

  if (myGroups.length === 0) return (
    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
      You're not in any groups yet.<br />
      <a href="/browse" style={{ color: 'var(--green)', marginTop: 8, display: 'inline-block' }}>Browse groups →</a>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, height: 'calc(100vh - 130px)', minHeight: 400 }}>
      {/* Sidebar */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '9px 12px', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '0.5px solid var(--border)' }}>
          My groups
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {myGroups.map(g => (
            <div key={g.group_id}
              onClick={() => selectGroup(g)}
              style={{
                padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid var(--border)',
                background: activeGroup?.group_id === g.group_id ? 'var(--green-light)' : 'transparent',
                transition: 'background 0.15s'
              }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: activeGroup?.group_id === g.group_id ? 'var(--green-dark)' : 'var(--text)' }}>
                {g.hall}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {g.room}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat main */}
      {activeGroup ? (
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', fontWeight: 500, fontSize: 13 }}>
            {activeGroup.hall} · {activeGroup.room}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                No messages yet. Say hi to your group! 👋
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.user_id === profile?.id
              const showName = !isMe && (i === 0 || messages[i - 1].user_id !== msg.user_id)
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                  {showName && (
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2, paddingLeft: 4 }}>
                      {msg.profiles?.display_name}
                    </div>
                  )}
                  <div style={{
                    padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                    background: isMe ? 'var(--green)' : 'var(--surface-2)',
                    color: isMe ? 'white' : 'var(--text)'
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, paddingLeft: 4 }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, fontSize: 13 }}
            />
            <button className="btn-primary" onClick={sendMessage} style={{ padding: '7px 14px', fontSize: 13 }}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
          Select a group to chat
        </div>
      )}
    </div>
  )
}
