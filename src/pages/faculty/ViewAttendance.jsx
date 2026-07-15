import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

export default function ViewAttendance() {
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    axiosClient.get('/faculty/subjects').then((res) => {
      setSubjects(res.data)
      if (res.data.length > 0) setSubjectId(res.data[0].id)
    })
  }, [])

  const search = async () => {
    if (!subjectId) return
    setLoading(true)
    setSearched(true)
    try {
      const params = { subjectId }
      if (from) params.from = from
      if (to) params.to = to
      const res = await axiosClient.get('/faculty/attendance', { params })
      setRecords(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>View attendance</h3>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Subject</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={search} disabled={loading || !subjectId}>
        {loading ? 'Loading…' : 'Search'}
      </button>

      <div style={{ marginTop: 18 }}>
        {searched && records.length === 0 && !loading && (
          <div className="empty-state">No attendance records found for this filter.</div>
        )}
        {records.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll number</th>
                <th>Marked at</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.attendanceId}>
                  <td>{r.studentName}</td>
                  <td>{r.rollNumber || '—'}</td>
                  <td>{new Date(r.markedAt).toLocaleString()}</td>
                  <td>{r.markedBy === 'SELF' ? 'Self-scan' : 'Manual'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
