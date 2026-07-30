import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Building2, Calendar, DollarSign, Shield, Star, User, LogOut, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ROLES } from '../../constants/enums';

export default function Layout() {
  const { user, logout } = useAuth();
  const { notifications, markAllRead } = useSocket();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const guestLinks = [
    { to: '/', label: 'Explore', icon: Home },
    { to: '/bookings', label: 'My Bookings', icon: Calendar },
  ];

  const hostLinks = [
    { to: '/host', label: 'Host Dashboard', icon: Building2 },
    { to: '/host/bookings', label: 'Booking Requests', icon: Calendar },
    { to: '/host/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/host/add-property', label: 'Add Property', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: Shield },
    { to: '/admin/properties', label: 'Property Approvals', icon: Building2 },
    { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/disputes', label: 'Disputes', icon: Shield },
  ];

  let navLinks = guestLinks;
  if (user?.role === ROLES.HOST) navLinks = [...guestLinks, ...hostLinks];
  if (user?.role === ROLES.ADMIN) navLinks = adminLinks;

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      end={to === '/' || to === '/host' || to === '/admin'}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
        }`
      }
      onClick={() => setMobileOpen(false)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-600">StayNest</span>
              </Link>

              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <NavItem key={link.to} {...link} />
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => { setShowNotifs(!showNotifs); markAllRead(); }}
                      className="relative p-2 rounded-lg hover:bg-gray-100"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -left-0.5 h-4 w-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifs && (
                      <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b font-medium text-sm">Notifications</div>
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-gray-500 text-center">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div key={n.id} className="p-3 border-b hover:bg-gray-50 text-sm">
                              <p className="font-medium">{n.title}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      {user.role === 'guest' ? 'Guest' : user.role === 'host' ? 'Host' : 'Admin'}
                    </span>
                  </Link>

                  <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100" title="Logout">
                    <LogOut className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 px-3 py-2">Login</Link>
                  <Link to="/signup" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Sign Up</Link>
                </div>
              )}

              {user && (
                <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && user && (
          <nav className="md:hidden border-t px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>StayNest © 2026 — Vacation rental platform</p>
        </div>
      </footer>
    </div>
  );
}
