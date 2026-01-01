import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <Link
                        to="/"
                        className="text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent hover:from-indigo-500 hover:to-violet-500 dark:hover:from-indigo-300 dark:hover:to-violet-300 transition-all"
                    >
                        BookingPlatform
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden sm:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/events"
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                        >
                            Events
                        </Link>
                        {isAuthenticated && isOrganizer && (
                            <Link
                                to="/organizer"
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right Section: Theme Toggle & Auth */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
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

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/my-bookings"
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                                >
                                    My Bookings
                                </Link>
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                                        {user?.name}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full">
                                        {user?.role}
                                    </span>

                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        className="relative hover:opacity-80 transition-opacity"
                                        title="Profile"
                                    >
                                        <img
                                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                                            alt="Profile"
                                            className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900"
                                        />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}