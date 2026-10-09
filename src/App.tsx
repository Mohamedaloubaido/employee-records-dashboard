import { useMemo, useState } from 'react'
import { Search, UserPlus, Users, UserCheck, UserX, Building2, Download } from 'lucide-react'

type EmployeeStatus = 'Active' | 'Inactive'
type Employee = {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: EmployeeStatus
}

const initialEmployees: Employee[] = [
  { id: 1, name: 'Olivia Martin', email: 'olivia@company.com', role: 'Product Designer', department: 'Design', status: 'Active' },
  { id: 2, name: 'Liam Carter', email: 'liam@company.com', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { id: 3, name: 'Emma Wilson', email: 'emma@company.com', role: 'HR Specialist', department: 'Human Resources', status: 'Active' },
  { id: 4, name: 'Noah Bennett', email: 'noah@company.com', role: 'Data Analyst', department: 'Operations', status: 'Inactive' },
  { id: 5, name: 'Sophia Davis', email: 'sophia@company.com', role: 'Account Manager', department: 'Sales', status: 'Active' },
  { id: 6, name: 'Ethan Brooks', email: 'ethan@company.com', role: 'QA Engineer', department: 'Engineering', status: 'Active' },
]

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | EmployeeStatus>('All')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return employees.filter((employee) => {
      const matchesQuery = !q || [employee.name, employee.email, employee.role, employee.department].some((value) => value.toLowerCase().includes(q))
      const matchesStatus = status === 'All' || employee.status === status
      return matchesQuery && matchesStatus
    })
  }, [employees, query, status])

  const active = employees.filter((e) => e.status === 'Active').length
  const inactive = employees.length - active
  const departments = new Set(employees.map((e) => e.department)).size

  const addEmployee = () => {
    const nextId = Math.max(0, ...employees.map((e) => e.id)) + 1
    setEmployees((current) => [
      { id: nextId, name: `New Employee ${nextId}`, email: `employee${nextId}@company.com`, role: 'Team Member', department: 'Operations', status: 'Active' },
      ...current,
    ])
  }

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Department', 'Status']
    const rows = filtered.map((e) => [e.name, e.email, e.role, e.department, e.status])
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">ER<span>.</span></div>
        <nav>
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#employees">Employees</a>
          <a href="#departments">Departments</a>
          <a href="#reports">Reports</a>
        </nav>
        <div className="sidebar-footer">Employee Records<br /><span>Portfolio Project</span></div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / PEOPLE</p>
            <h1>Employee Records</h1>
            <p className="subtitle">Manage employee information, status and team structure.</p>
          </div>
          <button className="primary" onClick={addEmployee}><UserPlus size={18} /> Add employee</button>
        </header>

        <section className="stats" id="dashboard">
          <Stat icon={<Users size={20} />} label="Total employees" value={employees.length} note="Current records" />
          <Stat icon={<UserCheck size={20} />} label="Active" value={active} note={`${Math.round((active / Math.max(employees.length, 1)) * 100)}% of workforce`} />
          <Stat icon={<UserX size={20} />} label="Inactive" value={inactive} note="Archived status" />
          <Stat icon={<Building2 size={20} />} label="Departments" value={departments} note="Across the company" />
        </section>

        <section className="panel" id="employees">
          <div className="panel-head">
            <div>
              <h2>Employee directory</h2>
              <p>{filtered.length} record{filtered.length === 1 ? '' : 's'} shown</p>
            </div>
            <button className="secondary" onClick={exportCsv}><Download size={17} /> Export CSV</button>
          </div>

          <div className="toolbar">
            <label className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees..." /></label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'All' | EmployeeStatus)}>
              <option>All</option><option>Active</option><option>Inactive</option>
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((employee) => (
                  <tr key={employee.id}>
                    <td><div className="person"><div className="avatar">{employee.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                    <td>{employee.role}</td><td>{employee.department}</td>
                    <td><span className={`badge ${employee.status.toLowerCase()}`}>{employee.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty">No employees match your filters.</div>}
          </div>
        </section>
      </main>
    </div>
  )
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note: string }) {
  return <article className="stat"><div className="stat-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div></article>
}
