import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import BrowsePage from './pages/BrowsePage'
import CreateGroupPage from './pages/CreateGroupPage'
import GroupDetailPage from './pages/GroupDetailPage'
import MyGroupPage from './pages/MyGroupPage'
import ChatPage from './pages/ChatPage'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/browse" replace />} />
            <Route path="browse" element={<BrowsePage />} />
            <Route path="browse/:id" element={<GroupDetailPage />} />
            <Route path="create" element={<CreateGroupPage />} />
            <Route path="my-group" element={<MyGroupPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:groupId" element={<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
