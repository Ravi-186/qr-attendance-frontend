import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="topbar">
      <div className="brand">
        <span className="finder-mark" />
        AttendQR
      </div>
      <div className="topbar-right">
        <span>{user?.name}</span>
        <span className="role-pill">{user?.role}</span>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </div>
    </div>
  )
}
