import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Storefront from './pages/Storefront';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import AdminLayout from './pages/admin/AdminLayout';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import Settings from './pages/admin/Settings';
import { LoadingState } from './components/StateViews';

function RequireAuth({ children }) {
  const { status } = useAuth();
  if (status === 'loading') return <LoadingState variant="admin" />;
  if (status !== 'authenticated') return <Navigate to="/admin/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { status } = useAuth();
  if (status === 'loading') return <LoadingState variant="admin" />;
  if (status === 'authenticated') return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/admin/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/admin/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

          <Route path="/:slug" element={<Storefront />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
