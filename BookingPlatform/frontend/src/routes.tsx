import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from './components/common/LoadingSpinner';

const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Events = React.lazy(() => import('./pages/Events'));
const EventDetails = React.lazy(() => import('./pages/EventDetails'));
const MyBookings = React.lazy(() => import('./pages/MyBookings'));
const OrganizerDashboard = React.lazy(() => import('./pages/organizer/OrganizerDashboard'));
const CreateEvent = React.lazy(() => import('./pages/organizer/CreateEvent'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Protected Route - requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

// Organizer Route - requires ORGANIZER or ADMIN role
const OrganizerRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}

const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

                {/* Protected Routes (any authenticated user) */}
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/bookings/:bookingId/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Organizer Routes */}
                <Route path="/organizer" element={<OrganizerRoute><OrganizerDashboard /></OrganizerRoute>} />
                <Route path="/organizer/events/new" element={<OrganizerRoute><CreateEvent /></OrganizerRoute>} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;