import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  const [apiStatus, setApiStatus] = React.useState('Checking API…')

  React.useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable')
        return response.json() as Promise<{ status: string }>
      })
      .then((result) => setApiStatus(result.status === 'ok' ? 'API connected' : 'API unavailable'))
      .catch(() => setApiStatus('API unavailable'))
  }, [])

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <span className="text-sm font-bold uppercase tracking-widest text-orange-600">FAAPS</span>
        <h1 className="mt-4 text-3xl font-semibold">Academic advising and study planning</h1>
        <p className="mt-3 text-slate-600">Spring Boot, React, Tailwind CSS and MySQL are ready for the first design.</p>
        <p className="mt-8 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700" role="status">{apiStatus}</p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
