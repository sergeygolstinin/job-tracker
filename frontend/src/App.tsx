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

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/jobs/')
      .then(response => {
        setJobs(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching jobs:', error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container">
      <h1>Job Application Tracker</h1>
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
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.position}</td>
                <td>{job.status}</td>
                <td>{job.applied_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App