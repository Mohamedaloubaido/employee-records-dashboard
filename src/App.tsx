import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Search, UserPlus, Users, UserCheck, UserX, Building2, Download, Pencil, Trash2, X, Eye, ChevronLeft, ChevronRight, LayoutDashboard, BarChart3 } from 'lucide-react'

type EmployeeStatus = 'Active' | 'Inactive'
type View = 'dashboard' | 'employees' | 'departments' | 'reports'
type Employee = { id: number; name: string; email: string; role: string; department: string; status: EmployeeStatus }
type SortKey = 'name' | 'role' | 'department' | 'status'

const initialEmployees: Employee[] = [
  { id: 1, name: 'Olivia Martin', email: 'olivia@company.com', role: 'Product Designer', department: 'Design', status: 'Active' },
  { id: 2, name: 'Liam Carter', email: 'liam@company.com', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { id: 3, name: 'Emma Wilson', email: 'emma@company.com', role: 'HR Specialist', department: 'Human Resources', status: 'Active' },
  { id: 4, name: 'Noah Bennett', email: 'noah@company.com', role: 'Data Analyst', department: 'Operations', status: 'Inactive' },
  { id: 5, name: 'Sophia Davis', email: 'sophia@company.com', role: 'Account Manager', department: 'Sales', status: 'Active' },
  { id: 6, name: 'Ethan Brooks', email: 'ethan@company.com', role: 'QA Engineer', department: 'Engineering', status: 'Active' },
  { id: 7, name: 'Mia Thompson', email: 'mia@company.com', role: 'Recruiter', department: 'Human Resources', status: 'Active' },
  { id: 8, name: 'Lucas Reed', email: 'lucas@company.com', role: 'Operations Coordinator', department: 'Operations', status: 'Active' },
  { id: 9, name: 'Ava Collins', email: 'ava@company.com', role: 'UX Researcher', department: 'Design', status: 'Inactive' },
  { id: 10, name: 'James Walker', email: 'james@company.com', role: 'Sales Executive', department: 'Sales', status: 'Active' },
]

const emptyForm: Omit<Employee, 'id'> = { name: '', email: '', role: '', department: '', status: 'Active' }
const titles: Record<View, [string, string]> = {
  dashboard: ['Employee Records', 'Overview of workforce status and team structure.'],
  employees: ['Employees', 'Manage employee records, roles and status.'],
  departments: ['Departments', 'See workforce distribution across departments.'],
  reports: ['Reports', 'Review workforce metrics and operational summaries.'],
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employee-records')
    return saved ? JSON.parse(saved) : initialEmployees
  })
  const [view, setView] = useState<View>('dashboard')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | EmployeeStatus>('All')
  const [department, setDepartment] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [viewing, setViewing] = useState<Employee | null>(null)
  const [form, setForm] = useState(emptyForm)
  const pageSize = 5

  useEffect(() => localStorage.setItem('employee-records', JSON.stringify(employees)), [employees])

  const departmentsList = useMemo(() => [...new Set(employees.map((e) => e.department))].sort(), [employees])
  const departmentStats = useMemo(() => departmentsList.map((name) => {
    const members = employees.filter((e) => e.department === name)
    const active = members.filter((e) => e.status === 'Active').length
    return { name, total: members.length, active, inactive: members.length - active, share: Math.round((members.length / Math.max(employees.length, 1)) * 100) }
  }), [departmentsList, employees])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return employees.filter((employee) => {
      const matchesQuery = !q || [employee.name, employee.email, employee.role, employee.department].some((value) => value.toLowerCase().includes(q))
      return matchesQuery && (status === 'All' || employee.status === status) && (department === 'All' || employee.department === department)
    }).sort((a, b) => (sortAsc ? 1 : -1) * a[sortKey].localeCompare(b[sortKey]))
  }, [employees, query, status, department, sortKey, sortAsc])

  useEffect(() => setPage(1), [query, status, department, sortKey, sortAsc])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const active = employees.filter((e) => e.status === 'Active').length
  const inactive = employees.length - active
  const activeRate = Math.round((active / Math.max(employees.length, 1)) * 100)

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (employee: Employee) => { setEditing(employee); setForm({ name: employee.name, email: employee.email, role: employee.role, department: employee.department, status: employee.status }); setModalOpen(true) }
  const saveEmployee = (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.role.trim() || !form.department.trim()) return
    if (editing) setEmployees((current) => current.map((employee) => employee.id === editing.id ? { ...employee, ...form } : employee))
    else setEmployees((current) => [{ id: Math.max(0, ...employees.map((e) => e.id)) + 1, ...form }, ...current])
    setModalOpen(false)
  }
  const deleteEmployee = (employee: Employee) => {
    if (!window.confirm(`Delete ${employee.name}?`)) return
    setEmployees((current) => current.filter((item) => item.id !== employee.id))
    if (viewing?.id === employee.id) setViewing(null)
  }
  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortAsc((v) => !v); else { setSortKey(key); setSortAsc(true) } }
  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Department', 'Status']
    const rows = filtered.map((e) => [e.name, e.email, e.role, e.department, e.status])
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">ER<span>.</span></div>
      <nav>
        <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={17} />} label="Dashboard" />
        <NavButton active={view === 'employees'} onClick={() => setView('employees')} icon={<Users size={17} />} label="Employees" />
        <NavButton active={view === 'departments'} onClick={() => setView('departments')} icon={<Building2 size={17} />} label="Departments" />
        <NavButton active={view === 'reports'} onClick={() => setView('reports')} icon={<BarChart3 size={17} />} label="Reports" />
      </nav>
      <div className="sidebar-footer">Employee Records<br /><span>Portfolio Project</span></div>
    </aside>

    <main>
      <header className="topbar">
        <div><p className="eyebrow">WORKSPACE / PEOPLE</p><h1>{titles[view][0]}</h1><p className="subtitle">{titles[view][1]}</p></div>
        {(view === 'dashboard' || view === 'employees') && <button className="primary" onClick={openAdd}><UserPlus size={18} /> Add employee</button>}
      </header>

      {(view === 'dashboard' || view === 'employees') && <section className="stats">
        <Stat icon={<Users size={20} />} label="Total employees" value={employees.length} note="Current records" />
        <Stat icon={<UserCheck size={20} />} label="Active" value={active} note={`${activeRate}% of workforce`} />
        <Stat icon={<UserX size={20} />} label="Inactive" value={inactive} note="Archived status" />
        <Stat icon={<Building2 size={20} />} label="Departments" value={departmentsList.length} note="Across the company" />
      </section>}

      {(view === 'dashboard' || view === 'employees') && <EmployeeDirectory />}

      {view === 'departments' && <section className="department-grid">
        {departmentStats.map((item) => <article className="department-card" key={item.name}>
          <div className="department-card-head"><div className="department-icon"><Building2 size={19} /></div><span>{item.share}% of workforce</span></div>
          <h3>{item.name}</h3><strong>{item.total}</strong><p>employees</p>
          <div className="mini-progress"><i style={{ width: `${item.share}%` }} /></div>
          <div className="department-meta"><span><b>{item.active}</b> Active</span><span><b>{item.inactive}</b> Inactive</span></div>
        </article>)}
      </section>}

      {view === 'reports' && <div className="reports-layout">
        <section className="panel report-card"><div className="panel-head"><div><h2>Workforce status</h2><p>Current employee status distribution</p></div></div><div className="report-body">
          <div className="donut" style={{ background: `conic-gradient(#0f172a 0 ${activeRate}%, #e2e8f0 ${activeRate}% 100%)` }}><div><strong>{activeRate}%</strong><span>Active</span></div></div>
          <div className="legend"><span><i className="dot dark" />Active <b>{active}</b></span><span><i className="dot light" />Inactive <b>{inactive}</b></span></div>
        </div></section>
        <section className="panel report-card"><div className="panel-head"><div><h2>Department distribution</h2><p>Employees by department</p></div></div><div className="bars">{departmentStats.map((item) => <div className="bar-row" key={item.name}><div><span>{item.name}</span><b>{item.total}</b></div><div className="bar-track"><i style={{ width: `${item.share}%` }} /></div></div>)}</div></section>
        <section className="panel summary-panel"><div className="panel-head"><div><h2>Summary</h2><p>Operational workforce snapshot</p></div><button className="secondary" onClick={exportCsv}><Download size={17} /> Export CSV</button></div><div className="summary-grid"><Summary label="Largest department" value={departmentStats.slice().sort((a,b)=>b.total-a.total)[0]?.name || '—'} /><Summary label="Active rate" value={`${activeRate}%`} /><Summary label="Total departments" value={String(departmentsList.length)} /><Summary label="Inactive records" value={String(inactive)} /></div></section>
      </div>}
    </main>

    {modalOpen && <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">EMPLOYEE RECORD</p><h2>{editing ? 'Edit employee' : 'Add employee'}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)}><X size={18} /></button></div><form onSubmit={saveEmployee}>
      <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Daniel Moore" /></label>
      <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="daniel@company.com" /></label>
      <div className="form-grid"><label>Role<input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Data Analyst" /></label><label>Department<input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Operations" /></label></div>
      <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}><option>Active</option><option>Inactive</option></select></label>
      <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary">{editing ? 'Save changes' : 'Add employee'}</button></div>
    </form></div></div>}

    {viewing && <div className="modal-backdrop" onMouseDown={() => setViewing(null)}><div className="modal details-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">EMPLOYEE PROFILE</p><h2>{viewing.name}</h2></div><button className="icon-button" onClick={() => setViewing(null)}><X size={18} /></button></div><div className="profile-top"><div className="avatar large">{initials(viewing.name)}</div><div><strong>{viewing.role}</strong><span>{viewing.department}</span></div></div><div className="detail-grid"><Detail label="Email" value={viewing.email} /><Detail label="Status" value={viewing.status} /><Detail label="Employee ID" value={`EMP-${String(viewing.id).padStart(4, '0')}`} /><Detail label="Department" value={viewing.department} /></div><div className="modal-actions"><button className="secondary" onClick={() => { const employee = viewing; setViewing(null); openEdit(employee) }}><Pencil size={16} /> Edit record</button></div></div></div>}
  </div>

  function EmployeeDirectory() { return <section className="panel"><div className="panel-head"><div><h2>Employee directory</h2><p>{filtered.length} record{filtered.length === 1 ? '' : 's'} shown</p></div><button className="secondary" onClick={exportCsv}><Download size={17} /> Export CSV</button></div><div className="toolbar"><label className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees..." /></label><select value={status} onChange={(e) => setStatus(e.target.value as 'All' | EmployeeStatus)}><option>All</option><option>Active</option><option>Inactive</option></select><select value={department} onChange={(e) => setDepartment(e.target.value)}><option>All</option>{departmentsList.map((item) => <option key={item}>{item}</option>)}</select></div><div className="table-wrap"><table><thead><tr><SortableHead label="Employee" active={sortKey === 'name'} asc={sortAsc} onClick={() => toggleSort('name')} /><SortableHead label="Role" active={sortKey === 'role'} asc={sortAsc} onClick={() => toggleSort('role')} /><SortableHead label="Department" active={sortKey === 'department'} asc={sortAsc} onClick={() => toggleSort('department')} /><SortableHead label="Status" active={sortKey === 'status'} asc={sortAsc} onClick={() => toggleSort('status')} /><th>Actions</th></tr></thead><tbody>{visible.map((employee) => <tr key={employee.id}><td><div className="person"><div className="avatar">{initials(employee.name)}</div><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td><td>{employee.role}</td><td>{employee.department}</td><td><span className={`badge ${employee.status.toLowerCase()}`}>{employee.status}</span></td><td><div className="actions"><button title="View" onClick={() => setViewing(employee)}><Eye size={16} /></button><button title="Edit" onClick={() => openEdit(employee)}><Pencil size={16} /></button><button className="danger" title="Delete" onClick={() => deleteEmployee(employee)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty">No employees match your filters.</div>}</div><div className="pagination"><span>Page {currentPage} of {totalPages}</span><div><button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button><button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><ChevronRight size={16} /></button></div></div></section> }
}

const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('')
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span>{label}</span></button> }
function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note: string }) { return <article className="stat"><div className="stat-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div></article> }
function SortableHead({ label, active, asc, onClick }: { label: string; active: boolean; asc: boolean; onClick: () => void }) { return <th><button className={`sort-button ${active ? 'active' : ''}`} onClick={onClick}>{label}<span>{active ? (asc ? '↑' : '↓') : '↕'}</span></button></th> }
function Detail({ label, value }: { label: string; value: string }) { return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div> }
function Summary({ label, value }: { label: string; value: string }) { return <div className="summary-item"><span>{label}</span><strong>{value}</strong></div> }
