import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    const isActive = (path: string) => location.pathname === path;

    const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
        <Link
            to={to}
            className={`relative px-1 py-2 font-medium transition-all duration-300 group ${isActive(to)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
        >
            {children}
            {/* Animated underline */}
            <span className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${isActive(to) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <Link
                        to="/"
                        className="group flex items-center gap-2"
                    >
                        {/* Animated logo icon */}
                        <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
                        </div>
                        <span className="text-xl font-bold gradient-text">
                            EventNest
                        </span>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/events">Events</NavLink>
                        {isAuthenticated && isOrganizer && (
                            <NavLink to="/organizer">Dashboard</NavLink>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Auth Section - Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/my-bookings"
                                        className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                                    >
                                        My Bookings
                                    </Link>

                                    {/* User Info */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                                            {user?.name}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full">
                                            {user?.role}
                                        </span>
                                    </div>

                                    {/* Profile & Logout */}
                                    <Link
                                        to="/profile"
                                        className="relative group"
                                        title="Profile"
                                    >
                                        <img
                                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 group-hover:border-emerald-400 dark:group-hover:border-emerald-600 transition-colors"
                                        />
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 scale-0 group-hover:scale-110 transition-transform duration-300" />
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 text-sm font-semibold bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 animate-slide-up">
                        <div className="flex flex-col gap-2">
                            <Link to="/" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/events" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                Events
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link to="/my-bookings" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                        My Bookings
                                    </Link>
                                    {isOrganizer && (
                                        <Link to="/organizer" className="px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link to="/profile" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="px-4 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                            {!isAuthenticated && (
                                <>
                                    <Link to="/login" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                        Login
                                    </Link>
                                    <Link to="/register" className="mx-4 mt-2 px-4 py-2.5 text-center font-semibold bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}