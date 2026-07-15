import { useEffect, useRef, useState } from 'react'
import axiosClient from '../../api/axiosClient'

export default function GenerateQr() {
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [validity, setValidity] = useState(10)
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const pollRef = useRef(null)
  const tickRef = useRef(null)

  useEffect(() => {
    loadSubjects()
    return () => {
      clearInterval(pollRef.current)
      clearInterval(tickRef.current)
    }
  }, [])

  const loadSubjects = async () => {
    const res = await axiosClient.get('/faculty/subjects')
    setSubjects(res.data)
    if (res.data.length > 0) setSubjectId(res.data[0].id)
  }

  const startPolling = (sessionId) => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await axiosClient.get(`/faculty/qr/session/${sessionId}/status`)
        setSession(res.data)
        if (!res.data.active) {
          clearInterval(pollRef.current)
        }
      } catch {
        clearInterval(pollRef.current)
      }
    }, 4000)
  }

  const startTicker = (expiresAt) => {
    clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemaining(secondsLeft)
      if (secondsLeft <= 0) clearInterval(tickRef.current)
    }, 1000)
  }

  const generate = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await axiosClient.post('/faculty/qr/generate', {
        subjectId: Number(subjectId),
        validityMinutes: Number(validity),
      })
      setSession(res.data)
      startPolling(res.data.sessionId)
      startTicker(res.data.expiresAt)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate QR code.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <h3>Generate a QR code</h3>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label>Subject</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.length === 0 && <option value="">No subjects assigned</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Valid for (minutes)</label>
          <input type="number" min="1" value={validity} onChange={(e) => setValidity(e.target.value)} />
        </div>

        <button className="btn btn-accent" onClick={generate} disabled={loading || !subjectId}>
          {loading ? 'Generating…' : 'Generate QR code'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Live session</h3>
        </div>

        {!session && <div className="empty-state">Generate a QR code to display it here.</div>}

        {session && (
          <div className="qr-box">
            <img src={session.qrImageBase64} alt="Attendance QR code" />
            <div className={`timer ${remaining <= 0 ? 'expired' : ''}`}>
              {remaining <= 0 ? 'Expired' : formatTime(remaining)}
            </div>
            <p className="muted">{session.subjectName}</p>
            <p><b>{session.presentCount}</b> student(s) marked present</p>
          </div>
        )}
      </div>
    </div>
  )
}
