import { useState } from 'react'
import Topbar from '../../components/Topbar'
import NavTabs from '../../components/NavTabs'
import SubjectManagement from './SubjectManagement'
import StudentManagement from './StudentManagement'
import AttendanceReports from './AttendanceReports'

const TABS = [
  { key: 'subjects', label: 'Subject Management' },
  { key: 'students', label: 'Student Management' },
  { key: 'reports', label: 'Attendance Reports' },
]

export default function AdminDashboard() {
  const [active, setActive] = useState('subjects')

  return (
    <div className="app-shell">
      <Topbar />
      <div className="main-content">
        <NavTabs tabs={TABS} active={active} onChange={setActive} />
        {active === 'subjects' && <SubjectManagement />}
        {active === 'students' && <StudentManagement />}
        {active === 'reports' && <AttendanceReports />}
      </div>
    </div>
  )
}
