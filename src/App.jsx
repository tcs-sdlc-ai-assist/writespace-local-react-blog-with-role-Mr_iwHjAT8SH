import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { Home } from './pages/Home.jsx';
import { WriteBlog } from './pages/WriteBlog.jsx';
import { ReadBlog } from './pages/ReadBlog.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { UserManagement } from './pages/UserManagement.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

/**
 * Root application component.
 * Defines all client-side routes using React Router v6 Routes/Route.
 *
 * Route map:
 * - '/'              → LandingPage (public)
 * - '/login'         → LoginPage (public)
 * - '/register'      → RegisterPage (public)
 * - '/dashboard'     → ProtectedRoute → Home
 * - '/create'        → ProtectedRoute → WriteBlog
 * - '/edit/:id'      → ProtectedRoute → WriteBlog
 * - '/read/:id'      → ProtectedRoute → ReadBlog
 * - '/admin'         → ProtectedRoute(adminOnly) → AdminDashboard
 * - '/admin/users'   → ProtectedRoute(adminOnly) → UserManagement
 * - '*'              → Redirect to '/'
 *
 * @returns {JSX.Element}
 */
export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <WriteBlog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <WriteBlog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/read/:id"
        element={
          <ProtectedRoute>
            <ReadBlog />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;