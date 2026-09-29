import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './auth.jsx';
import Browse from './pages/Browse.jsx';
import SpotDetail from './pages/SpotDetail.jsx';
import SpotForm from './pages/SpotForm.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Me from './pages/Me.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="muted center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/spots/:id" element={<SpotDetail />} />
          <Route
            path="/spots/new"
            element={
              <RequireAuth>
                <SpotForm />
              </RequireAuth>
            }
          />
          <Route
            path="/spots/:id/edit"
            element={
              <RequireAuth>
                <SpotForm />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users/:username" element={<Profile />} />
          <Route
            path="/me"
            element={
              <RequireAuth>
                <Me />
              </RequireAuth>
            }
          />
          <Route path="*" element={<p className="muted center">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
