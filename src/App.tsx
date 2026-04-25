import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import ProjectEditor from './pages/ProjectEditor'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/project/:id" element={<ProjectEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
