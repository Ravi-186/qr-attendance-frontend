import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

export default function MarkAttendance() {
  const [sessionId, setSessionId] = useState('')
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)

  useEffect(() => {
    axiosClient.get('/faculty/students').then((res) => setStudents(res.data))
  }, [])

  const filtered = students.filter((s) =>
    `${s.name} ${s.rollNumber}`.toLowerCase().includes(search.toLowerCase())
  )

  const markStudent = async (studentId) => {
    if (!sessionId) {
      setMessage({ type: 'error', text: 'Enter the session ID first (shown on the Generate QR Code tab).' })
      return
    }
    setSubmittingId(studentId)
    setMessage(null)
    try {
      const res = await axiosClient.post('/faculty/attendance/manual', {
        sessionId: Number(sessionId),
        studentId,
      })
      setMessage({ type: res.data.success ? 'success' : 'error', text: res.data.message })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not mark attendance.' })
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Manually mark attendance</h3>
          <p className="muted">Use this as a fallback if a student can't scan the QR code.</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="field">
        <label>Session ID (from Generate QR Code tab)</label>
        <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="e.g. 4" />
      </div>

      <div className="field">
        <label>Search student</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or roll number" />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No students found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll number</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.rollNumber || '—'}</td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => markStudent(s.id)}
                    disabled={submittingId === s.id}
                  >
                    {submittingId === s.id ? 'Marking…' : 'Mark present'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
