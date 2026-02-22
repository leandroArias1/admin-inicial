import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ui/ProtectedRoute';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Orders from './pages/orders/Orders';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute adminOnly><Products /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute adminOnly><Orders /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
