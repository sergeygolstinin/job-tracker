import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

interface JobApplication {
  id: number
  company: string
  position: string
  status: string
  applied_date: string
  notes: string
  job_url: string
}

const STATUS_OPTIONS = ['applied', 'not applied', 'interview', 'offer', 'rejected']

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'not applied',
    notes: '',
    job_url: '',
    applied_date: new Date().toISOString().split('T')[0]
  })

  const fetchJobs = () => {
  axios.get('https://job-tracker-production-6e05.up.railway.app/api/jobs/')
      .then(response => {
        setJobs(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching jobs:', error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSubmit = () => {
    if (!form.company || !form.position) return
    axios.post('https://job-tracker-production-6e05.up.railway.app/api/jobs/', form)
      .then(() => {
        fetchJobs()
        setForm({ company: '', position: '', status: 'not applied', notes: '', job_url: '', applied_date: new Date().toISOString().split('T')[0] })
      })
      .catch(error => console.error('Error adding job:', error))
  }

  const handleDelete = (id: number) => {
    axios.delete(`https://job-tracker-production-6e05.up.railway.app/api/jobs/${id}/`)
      .then(() => fetchJobs())
      .catch(error => console.error('Error deleting job:', error))
  }

  const handleEditSave = (id: number) => {
   axios.patch(`https://job-tracker-production-6e05.up.railway.app/api/jobs/${id}/`, { status: editStatus })
      .then(() => {
        fetchJobs()
        setEditingId(null)
      })
      .catch(error => console.error('Error updating job:', error))
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'applied': '#3b82f6',
      'not applied': '#6b7280',
      'interview': '#f59e0b',
      'offer': '#10b981',
      'rejected': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className="container">
      <h1>Job Application Tracker</h1>

      <div className="form">
        <h2>Add New Application</h2>
        <div className="form-row">
          <input
            placeholder="Company"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
          />
          <input
            placeholder="Position"
            value={form.position}
            onChange={e => setForm({ ...form, position: e.target.value })}
          />
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
           <input
            type="date"
            value={form.applied_date}
            onChange={e => setForm({ ...form, applied_date: e.target.value })}
          />
          <input
            placeholder="Job URL (optional)"
            value={form.job_url}
            onChange={e => setForm({ ...form, job_url: e.target.value })}
          />
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
          <button onClick={handleSubmit}>Add Job</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.position}</td>
                <td>
                  {editingId === job.id ? (
                    <select
                      className="edit-select"
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                      {job.status}
                    </span>
                  )}
                </td>
                <td>{job.applied_date}</td>
                <td>
                  <div className="actions">
                    {editingId === job.id ? (
                      <button className="edit-btn" onClick={() => handleEditSave(job.id)}>
                        Save
                      </button>
                    ) : (
                      <button className="edit-btn" onClick={() => {
                        setEditingId(job.id)
                        setEditStatus(job.status)
                      }}>
                        Edit
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => handleDelete(job.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App