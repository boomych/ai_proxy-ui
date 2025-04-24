import React, { useState, useEffect, useRef } from 'react'

export default function ChatUI() {
  const [username, setUsername] = useState("")
  const [codeword, setCodeword] = useState("")
  const [token, setToken] = useState("")
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [limit, setLimit] = useState(50)
  const scrollRef = useRef(null)
  const API_BASE = "https://ai-proxy-service-dvu7.onrender.com:8000";

  const authenticate = async () => {
    const res = await fetch(`${API_BASE}/auth/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeword })
    })
    const data = await res.json()
    if (res.ok) {
      setToken(data.token)
    } else {
      alert("Auth failed: " + data.detail)
    }
  }

  const loadMessages = async () => {
    const res = await fetch(`${API_BASE}/messages?from_id=0&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) {
      setMessages(data)
    }
  }

  useEffect(() => {
    if (!token) return
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [token, limit])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    await fetch(`${API_BASE}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: trimmed })
    })
    setText("")
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      {!token && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Codeword" type="password" value={codeword} onChange={e => setCodeword(e.target.value)} />
          <button onClick={authenticate}>Login</button>
        </div>
      )}

      {token && (
        <>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Show last: </label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ width: '80px' }}
            /> messages
          </div>

          <div
            ref={scrollRef}
            style={{
              height: 'calc(100vh - 250px)',
              width: 'calc(100vh - 200px)',
              overflowY: 'scroll',
              padding: '0.5rem',
              backgroundColor: '#1e1e1e',
              color: '#f0f0f0',
              border: '1px solid #444',
              marginBottom: '1rem',
              borderRadius: '6px'
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.message_id}
                style={{
                  border: '1px solid #333',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  backgroundColor: '#2c2c2c'
                }}
              >
                <div>
                  <strong>
                    {msg.from_is_human ? "👤" : "🤖"} {msg.from_username}
                  </strong>
                </div>
                <div>{msg.message}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                  {new Date(msg.datetime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              style={{ flex: 1, height: '60px' }}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  )
}