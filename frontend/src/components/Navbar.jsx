import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
    }`;

  const touristLinks = [
    { to: '/tourist', label: '🏠 Dashboard' },
    { to: '/places', label: '🗺️ Places' },
    { to: '/hotels', label: '🏨 Hotels' },
    { to: '/my-bookings', label: '📋 Bookings' },
    { to: '/favorites', label: '❤️ Favorites' },
    { to: '/trip-planner', label: '✈️ Trip Planner' },
    { to: '/notifications', label: '🔔 Notifications' },
  ];

  const ownerLinks = [
    { to: '/hotel-owner', label: '🏠 Dashboard' },
    { to: '/hotels', label: '🏨 My Hotels' },
    { to: '/notifications', label: '🔔 Notifications' },
  ];

  const adminLinks = [
    { to: '/admin', label: '🏠 Dashboard' },
    { to: '/places', label: '🗺️ Places' },
    { to: '/hotels', label: '🏨 Hotels' },
    { to: '/notifications', label: '🔔 Notifications' },
  ];

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'tourist') return touristLinks;
    if (user.role === 'hotel_owner') return ownerLinks;
    if (user.role === 'admin') return adminLinks;
    return [];
  };

  const navLinks = getLinks();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🌏</span>
            </div>
            <span className="font-bold text-slate-800 hidden sm:block">AI Tourism</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass(l.to)}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block ${linkClass(l.to)}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-blue-50"
              onClick={() => setMobileOpen(false)}
            >
              👤 {user.username}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
