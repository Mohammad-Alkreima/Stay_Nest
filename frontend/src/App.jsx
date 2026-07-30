import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ProtectedRoute, GuestRoute, HostRoute, AdminRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import HostDashboard from './pages/host/HostDashboard';
import HostBookings from './pages/host/HostBookings';
import HostEarnings from './pages/host/HostEarnings';
import CreateProperty from './pages/host/CreateProperty';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminProperties from './pages/admin/AdminProperties';
import AdminReviews from './pages/admin/AdminReviews';
import AdminDisputes from './pages/admin/AdminDisputes';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Layout />}>
        <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="properties/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
        <Route path="bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="host" element={<HostRoute><HostDashboard /></HostRoute>} />
        <Route path="host/bookings" element={<HostRoute><HostBookings /></HostRoute>} />
        <Route path="host/earnings" element={<HostRoute><HostEarnings /></HostRoute>} />
        <Route path="host/add-property" element={<HostRoute><CreateProperty /></HostRoute>} />
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
        <Route path="admin/properties" element={<AdminRoute><AdminProperties /></AdminRoute>} />
        <Route path="admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
        <Route path="admin/disputes" element={<AdminRoute><AdminDisputes /></AdminRoute>} />
        <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
