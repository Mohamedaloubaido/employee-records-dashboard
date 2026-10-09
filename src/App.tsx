import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Search, UserPlus, Users, UserCheck, UserX, Building2, Download, Pencil, Trash2, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

type EmployeeStatus = 'Active' | 'Inactive'
type Employee = {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: EmployeeStatus
}

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

const emptyForm: Omit<Employee, 'id'> = {
  name: '',
  email: '',
  role: '',
  department: '',
  status: 'Active',
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employee-records')
    return saved ? JSON.parse(saved) : initialEmployees
  })
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

  useEffect(() => {
    localStorage.setItem('employee-records', JSON.stringify(employees))
  }, [employees])

  const departmentsList = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees],
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return employees
      .filter((employee) => {
        const matchesQuery = !q || [employee.name, employee.email, employee.role, employee.department].some((value) => value.toLowerCase().includes(q))
        const matchesStatus = status === 'All' || employee.status === status
        const matchesDepartment = department === 'All' || employee.department === department
        return matchesQuery && matchesStatus && matchesDepartment
      })
      .sort((a, b) => {
        const result = a[sortKey].localeCompare(b[sortKey])
        return sortAsc ? result : -result
      })
  }, [employees, query, status, department, sortKey, sortAsc])

  useEffect(() => setPage(1), [query, status, department, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const active = employees.filter((e) => e.status === 'Active').length
  const inactive = employees.length - active
  const departments = new Set(employees.map((e) => e.department)).size

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (employee: Employee) => {
    setEditing(employee)
    setForm({ name: employee.name, email: employee.email, role: employee.role, department: employee.department, status: employee.status })
    setModalOpen(true)
  }

  const saveEmployee = (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.role.trim() || !form.department.trim()) return

    if (editing) {
      setEmployees((current) => current.map((employee) => employee.id === editing.id ? { ...employee, ...form } : employee))
    } else {
      const nextId = Math.max(0, ...employees.map((e) => e.id)) + 1
      setEmployees((current) => [{ id: nextId, ...form }, ...current])
    }
    setModalOpen(false)
  }

  const deleteEmployee = (employee: Employee) => {
    if (!window.confirm(`Delete ${employee.name}?`)) return
    setEmployees((current) => current.filter((item) => item.id !== employee.id))
    if (viewing?.id === employee.id) setViewing(null)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((value) => !value)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
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
          <button className="primary" onClick={openAdd}><UserPlus size={18} /> Add employee</button>
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
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option>All</option>{departmentsList.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <SortableHead label="Employee" active={sortKey === 'name'} asc={sortAsc} onClick={() => toggleSort('name')} />
                  <SortableHead label="Role" active={sortKey === 'role'} asc={sortAsc} onClick={() => toggleSort('role')} />
                  <SortableHead label="Department" active={sortKey === 'department'} asc={sortAsc} onClick={() => toggleSort('department')} />
                  <SortableHead label="Status" active={sortKey === 'status'} asc={sortAsc} onClick={() => toggleSort('status')} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((employee) => (
                  <tr key={employee.id}>
                    <td><div className="person"><div className="avatar">{employee.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                    <td>{employee.role}</td><td>{employee.department}</td>
                    <td><span className={`badge ${employee.status.toLowerCase()}`}>{employee.status}</span></td>
                    <td><div className="actions"><button title="View" onClick={() => setViewing(employee)}><Eye size={16} /></button><button title="Edit" onClick={() => openEdit(employee)}><Pencil size={16} /></button><button className="danger" title="Delete" onClick={() => deleteEmployee(employee)}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty">No employees match your filters.</div>}
          </div>

          <div className="pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div><button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button><button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><ChevronRight size={16} /></button></div>
          </div>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><p className="eyebrow">EMPLOYEE RECORD</p><h2>{editing ? 'Edit employee' : 'Add employee'}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)}><X size={18} /></button></div>
            <form onSubmit={saveEmployee}>
              <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Daniel Moore" /></label>
              <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="daniel@company.com" /></label>
              <div className="form-grid"><label>Role<input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Data Analyst" /></label><label>Department<input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Operations" /></label></div>
              <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}><option>Active</option><option>Inactive</option></select></label>
              <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary">{editing ? 'Save changes' : 'Add employee'}</button></div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="modal-backdrop" onMouseDown={() => setViewing(null)}>
          <div className="modal details-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><p className="eyebrow">EMPLOYEE PROFILE</p><h2>{viewing.name}</h2></div><button className="icon-button" onClick={() => setViewing(null)}><X size={18} /></button></div>
            <div className="profile-top"><div className="avatar large">{viewing.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div><div><strong>{viewing.role}</strong><span>{viewing.department}</span></div></div>
            <div className="detail-grid"><Detail label="Email" value={viewing.email} /><Detail label="Status" value={viewing.status} /><Detail label="Employee ID" value={`EMP-${String(viewing.id).padStart(4, '0')}`} /><Detail label="Department" value={viewing.department} /></div>
            <div className="modal-actions"><button className="secondary" onClick={() => { setViewing(null); openEdit(viewing) }}><Pencil size={16} /> Edit record</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note: string }) {
  return <article className="stat"><div className="stat-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div></article>
}

function SortableHead({ label, active, asc, onClick }: { label: string; active: boolean; asc: boolean; onClick: () => void }) {
  return <th><button className={`sort-button ${active ? 'active' : ''}`} onClick={onClick}>{label}<span>{active ? (asc ? '↑' : '↓') : '↕'}</span></button></th>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>
}
