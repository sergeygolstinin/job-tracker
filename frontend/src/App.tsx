import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const API = 'https://job-tracker-production-6e05.up.railway.app/api/jobs'

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

const emptyForm = {
  company: '',
  position: '',
  status: 'not applied',
  notes: '',
  job_url: '',
  applied_date: new Date().toISOString().split('T')[0]
}

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchJobs = () => {
    axios.get(`${API}/`)
      .then(response => {
        setJobs(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching jobs:', error)
        setLoading(false)
      })
  }

  useEffect(() => { fetchJobs() }, [])

  const isValidUrl = (url: string) => {
    if (!url) return true
    try { new URL(url); return true } catch { return false }
  }

  const handleSubmit = () => {
    if (!form.company || !form.position) {
      setFormError('Company and Position are required.')
      return
    }
    if (!isValidUrl(form.job_url)) {
      setFormError('Please enter a valid URL (e.g. https://example.com) or leave it empty.')
      return
    }
    setFormError('')
    axios.post(`${API}/`, form)
      .then(() => { fetchJobs(); setForm(emptyForm) })
      .catch(error => console.error('Error adding job:', error))
  }

  const handleDelete = (id: number) => {
    axios.delete(`${API}/${id}/`)
      .then(() => fetchJobs())
      .catch(error => console.error('Error deleting job:', error))
  }

  const handleEditSave = (id: number) => {
    if (!isValidUrl(editForm.job_url)) {
      alert('Please enter a valid URL or leave it empty.')
      return
    }
    axios.patch(`${API}/${id}/`, editForm)
      .then(() => { fetchJobs(); setEditingId(null) })
      .catch(error => console.error('Error updating job:', error))
  }

  const startEdit = (job: JobApplication) => {
    setEditingId(job.id)
    setEditForm({
      company: job.company,
      position: job.position,
      status: job.status,
      notes: job.notes,
      job_url: job.job_url,
      applied_date: job.applied_date
    })
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
        {formError && <p className="error">{formError}</p>}
        <div className="form-row">
          <input placeholder="Company" value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })} />
          <input placeholder="Position" value={form.position}
            onChange={e => setForm({ ...form, position: e.target.value })} />
          <select value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row">
          <input type="date" value={form.applied_date}
            onChange={e => setForm({ ...form, applied_date: e.target.value })} />
          <input placeholder="Job URL (optional)" value={form.job_url}
            onChange={e => setForm({ ...form, job_url: e.target.value })} />
          <input placeholder="Notes (optional)" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={handleSubmit}>Add Job</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
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
              <>
                <tr key={job.id} className="job-row"
                  onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
                  <td>{editingId === job.id
                    ? <input className="edit-input" value={editForm.company}
                        onChange={e => setEditForm({ ...editForm, company: e.target.value })} />
                    : job.company}
                  </td>
                  <td>{editingId === job.id
                    ? <input className="edit-input" value={editForm.position}
                        onChange={e => setEditForm({ ...editForm, position: e.target.value })} />
                    : job.position}
                  </td>
                  <td>{editingId === job.id
                    ? <select className="edit-select" value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    : <span className="badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                        {job.status}
                      </span>}
                  </td>
                  <td>{editingId === job.id
                    ? <input type="date" className="edit-input" value={editForm.applied_date}
                        onChange={e => setEditForm({ ...editForm, applied_date: e.target.value })} />
                    : job.applied_date}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="actions">
                      {editingId === job.id ? (
                        <>
                          <button className="edit-btn" onClick={() => handleEditSave(job.id)}>Save</button>
                          <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="edit-btn" onClick={() => startEdit(job)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(job.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === job.id && (
                  <tr key={`${job.id}-expanded`} className="expanded-row">
                    <td colSpan={5}>
                      <div className="expanded-content">
                        {editingId === job.id ? (
                          <>
                            <div className="expanded-field">
                              <label>Job URL</label>
                              <input className="edit-input" placeholder="Job URL" value={editForm.job_url}
                                onChange={e => setEditForm({ ...editForm, job_url: e.target.value })} />
                            </div>
                            <div className="expanded-field">
                              <label>Notes</label>
                              <textarea className="edit-textarea" placeholder="Notes" value={editForm.notes}
                                onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="expanded-field">
                              <label>Job URL</label>
                              {job.job_url
                                ? <a href={job.job_url} target="_blank" rel="noopener noreferrer">{job.job_url}</a>
                                : <span className="empty">No URL provided</span>}
                            </div>
                            <div className="expanded-field">
                              <label>Notes</label>
                              <p>{job.notes || <span className="empty">No notes</span>}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App