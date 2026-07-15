export default function NavTabs({ tabs, active, onChange }) {
  return (
    <div className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-tab ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
