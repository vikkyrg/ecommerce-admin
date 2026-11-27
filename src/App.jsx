import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import CategoryManagement from './pages/CategoryManagement';
import BrandManagement from './pages/BrandManagement';
import ProductManagement from './pages/ProductManagement';
import ExcelImport from './pages/ExcelImport';
import CustomersManagement from './pages/CustomersManagement';
import EnquiriesManagement from './pages/EnquiriesManagement';
import OrderManagement from './pages/OrderManagement';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1114] flex items-center justify-center text-white text-xs">
        Verifying admin authorization...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/brands" element={<BrandManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/customers" element={<CustomersManagement />} />
            <Route path="/enquiries" element={<EnquiriesManagement />} />
            <Route path="/import" element={<ExcelImport />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}
