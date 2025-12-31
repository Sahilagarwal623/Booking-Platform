import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <Link
                        to="/"
                        className="text-xl font-bold bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-violet-300"
                    >
                        BookingPlatform
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden sm:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-slate-300 hover:text-white font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/events"
                            className="text-slate-300 hover:text-white font-medium"
                        >
                            Events
                        </Link>
                        {isAuthenticated && isOrganizer && (
                            <Link
                                to="/organizer"
                                className="text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/my-bookings"
                                    className="text-slate-300 hover:text-white font-medium"
                                >
                                    My Bookings
                                </Link>
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-slate-400 text-sm">
                                        {user?.name}
                                    </span>
                                    {isOrganizer && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
                                            {user?.role}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-slate-300 hover:text-white font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
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