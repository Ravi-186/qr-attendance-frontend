import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

const emptyForm = { name: '', username: '', email: '', password: '', rollNumber: '', department: '' }

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await axiosClient.get('/admin/students')
    setStudents(res.data)
  }

  const handleChange = (field, value) => setForm({ ...form, [field]: value })

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await axiosClient.post('/admin/students', { ...form, role: 'STUDENT' })
      setForm(emptyForm)
      setMessage('Student added successfully.')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add student.')
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditForm({ name: s.name, email: s.email, rollNumber: s.rollNumber || '', department: s.department || '', password: '', active: s.active })
  }

  const saveEdit = async (id) => {
    try {
      await axiosClient.put(`/admin/students/${id}`, editForm)
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update student.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student? This cannot be undone.')) return
    await axiosClient.delete(`/admin/students/${id}`)
    load()
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Add student</h3>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="field">
              <label>Full name</label>
              <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Username</label>
              <input value={form.username} onChange={(e) => handleChange('username', e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required />
            </div>
            <div className="field">
              <label>Roll number</label>
              <input value={form.rollNumber} onChange={(e) => handleChange('rollNumber', e.target.value)} required />
            </div>
            <div className="field">
              <label>Class / Section</label>
              <input value={form.department} onChange={(e) => handleChange('department', e.target.value)} placeholder="e.g. CSE-A" />
            </div>
          </div>
          <button className="btn btn-accent" type="submit">Add student</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All students ({students.length})</h3>
        </div>
        {students.length === 0 ? (
          <div className="empty-state">No students added yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll no.</th>
                <th>Class</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                editingId === s.id ? (
                  <tr key={s.id}>
                    <td><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                    <td><input value={editForm.rollNumber} onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })} /></td>
                    <td><input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} /></td>
                    <td><input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(s.id)}>Save</button>{' '}
                      <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.rollNumber || '—'}</td>
                    <td>{s.department || '—'}</td>
                    <td>{s.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(s)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
