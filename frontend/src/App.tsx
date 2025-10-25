import { Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, Container } from '@mui/material'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import Partners from './routes/Partners'
import Stock from './routes/Stock'
import Layout from './components/Layout'

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/stock" element={<Stock />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
