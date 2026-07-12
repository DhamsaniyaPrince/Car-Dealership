import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, GuestRoute } from './routes/RouteGuards';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';

// Dashboard Pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { InventoryAdminPage } from './pages/dashboard/InventoryAdminPage';
import { CarFormPage } from './pages/dashboard/CarFormPage';
import { UserDashboard } from './pages/dashboard/UserDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Navigation */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="vehicles" element={<InventoryPage />} />
                <Route path="vehicles/:id" element={<CarDetailPage />} />
                <Route path="profile" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><UserDashboard /></ProtectedRoute>} />
                
                {/* Catch-all undefined routes (404 Page) */}
                <Route path="404" element={<NotFoundPage />} />
              </Route>

              {/* Authentication Portal */}
              <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Administrative Portal (Locked to Admin role) */}
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardOverview />} />
                <Route path="vehicles" element={<InventoryAdminPage />} />
                <Route path="inventory/new" element={<CarFormPage />} />
                <Route path="inventory/:id/edit" element={<CarFormPage />} />
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
