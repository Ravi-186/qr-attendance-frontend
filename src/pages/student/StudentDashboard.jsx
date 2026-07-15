import { useState } from 'react'
import Topbar from '../../components/Topbar'
import NavTabs from '../../components/NavTabs'
import ScanQr from './ScanQr'
import AttendanceHistory from './AttendanceHistory'

const TABS = [
  { key: 'scan', label: 'Scan QR Code' },
  { key: 'history', label: 'Attendance History' },
]

export default function StudentDashboard() {
  const [active, setActive] = useState('scan')

  return (
    <div className="app-shell">
      <Topbar />
      <div className="main-content">
        <NavTabs tabs={TABS} active={active} onChange={setActive} />
        {active === 'scan' && <ScanQr />}
        {active === 'history' && <AttendanceHistory />}
      </div>
    </div>
  )
}
