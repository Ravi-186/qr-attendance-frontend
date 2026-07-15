import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

const emptyFaculty = { name: '', username: '', email: '', password: '', department: '' }
const emptySubject = { name: '', code: '', semester: '', facultyId: '' }

export default function SubjectManagement() {
  const [faculty, setFaculty] = useState([])
  const [subjects, setSubjects] = useState([])
  const [facultyForm, setFacultyForm] = useState(emptyFaculty)
  const [subjectForm, setSubjectForm] = useState(emptySubject)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [facultyRes, subjectRes] = await Promise.all([
      axiosClient.get('/admin/faculty'),
      axiosClient.get('/admin/subjects'),
    ])
    setFaculty(facultyRes.data)
    setSubjects(subjectRes.data)
  }

  const addFaculty = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await axiosClient.post('/admin/faculty', { ...facultyForm, role: 'FACULTY' })
      setFacultyForm(emptyFaculty)
      setMessage('Faculty account created.')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create faculty account.')
    }
  }

  const addSubject = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await axiosClient.post('/admin/subjects', { ...subjectForm, facultyId: Number(subjectForm.facultyId) })
      setSubjectForm(emptySubject)
      setMessage('Subject created.')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create subject.')
    }
  }

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject? Existing attendance records will remain linked to it.')) return
    await axiosClient.delete(`/admin/subjects/${id}`)
    load()
  }

  const reassignFaculty = async (subject, facultyId) => {
    await axiosClient.put(`/admin/subjects/${subject.id}`, { ...subject, facultyId: Number(facultyId) })
    load()
  }

  return (
    <>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Add faculty account</h3></div>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={addFaculty}>
            <div className="field">
              <label>Full name</label>
              <input value={facultyForm.name} onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Username</label>
              <input value={facultyForm.username} onChange={(e) => setFacultyForm({ ...facultyForm, username: e.target.value })} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={facultyForm.email} onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={facultyForm.password} onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })} required />
            </div>
            <div className="field">
              <label>Department</label>
              <input value={facultyForm.department} onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })} placeholder="e.g. Computer Science" />
            </div>
            <button className="btn btn-accent" type="submit">Add faculty</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h3>Add subject</h3></div>
          <form onSubmit={addSubject}>
            <div className="field">
              <label>Subject name</label>
              <input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Subject code</label>
              <input value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} required />
            </div>
            <div className="field">
              <label>Semester</label>
              <input value={subjectForm.semester} onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })} placeholder="e.g. 3" />
            </div>
            <div className="field">
              <label>Assign faculty</label>
              <select value={subjectForm.facultyId} onChange={(e) => setSubjectForm({ ...subjectForm, facultyId: e.target.value })} required>
                <option value="">Select faculty</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-accent" type="submit" disabled={faculty.length === 0}>Add subject</button>
            {faculty.length === 0 && <p className="muted" style={{ marginTop: 8 }}>Add a faculty account first.</p>}
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>All subjects ({subjects.length})</h3></div>
        {subjects.length === 0 ? (
          <div className="empty-state">No subjects added yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Semester</th>
                <th>Faculty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.semester || '—'}</td>
                  <td>
                    <select value={s.facultyId || ''} onChange={(e) => reassignFaculty(s, e.target.value)}>
                      {faculty.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteSubject(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
