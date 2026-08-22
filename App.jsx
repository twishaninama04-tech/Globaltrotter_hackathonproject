import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/MyTripsPage';
import CreateTripPage from './pages/CreateTripPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import CitySearchPage from './pages/CitySearchPage';
import BudgetPage from './pages/BudgetPage';
import SharedTripPage from './pages/SharedTripPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Authenticating user session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainLayout({ children }) {
  const location = useLocation();
  const hideNavbarFooter = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {!hideNavbarFooter && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!hideNavbarFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/shared/:token" element={<SharedTripPage />} />

          {/* Protected Application Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
          <Route path="/trips/new" element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />
          <Route path="/trips/:id/builder" element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />
          <Route path="/trips/:id/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><CitySearchPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </AuthProvider>
  );
}
