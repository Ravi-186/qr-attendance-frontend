import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

export default function AttendanceHistory() {
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [historyRes, summaryRes] = await Promise.all([
        axiosClient.get('/student/attendance/history'),
        axiosClient.get('/student/attendance/summary'),
      ])
      setHistory(historyRes.data)
      setSummary(summaryRes.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Attendance by subject</h3>
        </div>
        {summary.length === 0 && !loading && (
          <div className="empty-state">No sessions have been held yet.</div>
        )}
        {summary.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Attended</th>
                <th>Total sessions</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.subjectId}>
                  <td>{s.subjectName}</td>
                  <td>{s.attendedSessions}</td>
                  <td>{s.totalSessions}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: s.percentage >= 75 ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: s.percentage >= 75 ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {s.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent attendance</h3>
        </div>
        {history.length === 0 && !loading && (
          <div className="empty-state">You haven't marked any attendance yet.</div>
        )}
        {history.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date &amp; time</th>
                <th>Marked by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.attendanceId}>
                  <td>{h.subjectName} ({h.subjectCode})</td>
                  <td>{new Date(h.markedAt).toLocaleString()}</td>
                  <td>{h.markedBy === 'SELF' ? 'Self-scan' : 'Faculty'}</td>
                  <td><span className="status-badge status-present">{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
