import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookingService } from '../api/booking.api';
import type { Booking } from '../types/booking.types';

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelModal, setCancelModal] = useState<{ bookingId: string; eventTitle: string } | null>(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await BookingService.getMyBookings();
                setBookings(response.data.bookings);
            } catch (err) {
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleCancel = async () => {
        if (!cancelModal) return;

        try {
            setCancelling(true);
            await BookingService.cancelBooking(cancelModal.bookingId);
            setBookings(bookings.map(b =>
                b.id === cancelModal.bookingId ? { ...b, status: 'CANCELLED' as const } : b
            ));
            setCancelModal(null);
        } catch (err) {
            setCancelModal(null);
            // Show error inline or via toast
        } finally {
            setCancelling(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'PENDING':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'EXPIRED':
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-200 dark:bg-slate-800/50 rounded-xl h-40 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">My Bookings</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage and view your event bookings</p>
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none transition-colors duration-200">
                    <svg className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No bookings yet</p>
                    <p className="text-slate-400 dark:text-slate-500 mb-6">Start by browsing our upcoming events</p>
                    <Link
                        to="/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
                    >
                        Browse Events
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm dark:shadow-none"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Event Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        {/* Event Icon */}
                                        <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg shrink-0">
                                            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                                                    {booking.event?.title || 'Event'}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {booking.event?.eventDate ? new Date(booking.event.eventDate).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {booking.event?.venue?.name || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                    {booking.items?.length || 0} seat{(booking.items?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                                    <div className="text-right">
                                        <p className="text-slate-500 dark:text-slate-500 text-xs">Total</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">₹{booking.totalAmount}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/events/${booking.eventId}`}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg transition-colors"
                                        >
                                            View Event
                                        </Link>
                                        {booking.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => setCancelModal({
                                                    bookingId: booking.id,
                                                    eventTitle: booking.event?.title || 'this booking'
                                                })}
                                                className="px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-500/50 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Booked Date */}
                            <p className="text-slate-500 dark:text-slate-500 text-xs mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {cancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => !cancelling && setCancelModal(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancel Booking?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to cancel your booking for <span className="font-medium text-slate-900 dark:text-white">{cancelModal.eventTitle}</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCancelModal(null)}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {cancelling ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Cancelling...
                                        </>
                                    ) : (
                                        'Yes, Cancel'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
