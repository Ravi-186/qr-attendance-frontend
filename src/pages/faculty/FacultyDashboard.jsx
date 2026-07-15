import { useState } from 'react'
import Topbar from '../../components/Topbar'
import NavTabs from '../../components/NavTabs'
import GenerateQr from './GenerateQr'
import MarkAttendance from './MarkAttendance'
import ViewAttendance from './ViewAttendance'

const TABS = [
  { key: 'generate', label: 'Generate QR Code' },
  { key: 'mark', label: 'Mark Attendance' },
  { key: 'view', label: 'View Attendance' },
]

export default function FacultyDashboard() {
  const [active, setActive] = useState('generate')

  return (
    <div className="app-shell">
      <Topbar />
      <div className="main-content">
        <NavTabs tabs={TABS} active={active} onChange={setActive} />
        {active === 'generate' && <GenerateQr />}
        {active === 'mark' && <MarkAttendance />}
        {active === 'view' && <ViewAttendance />}
      </div>
    </div>
  )
}
