import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BookingService } from '../api/booking.api';
import type { Event } from '../types/event.types';

interface Seat {
    id: string;
    row: string;
    number: number;
    price: number;
    sectionName?: string;
}

interface BookingData {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    finalAmount: number;
    status: string;
    expiresAt: string;
}

interface LocationState {
    booking: BookingData;
    event: Event;
    selectedSeats: Seat[];
}

export default function PaymentPage() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;

    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const booking = state?.booking;
    const event = state?.event;
    const selectedSeats = state?.selectedSeats || [];

    // Calculate time left until booking expires
    useEffect(() => {
        if (!booking?.expiresAt) return;

        const updateTimeLeft = () => {
            const expiresAt = new Date(booking.expiresAt).getTime();
            const now = Date.now();
            const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
            setTimeLeft(diff);

            if (diff === 0) {
                alert('Your booking has expired. Please try again.');
                navigate('/events');
            }
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [booking?.expiresAt, navigate]);

    // Handle back navigation warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };

        // Handle browser back button
        const handlePopState = () => {
            // Prevent navigation by pushing the current state back to history
            // usage of window.history.state ensures we preserve React Router's state wrapper
            window.history.pushState(window.history.state, '', window.location.href);
            // Show custom confirmation modal
            setShowCancelModal(true);
        };

        // Push initial state to enable popstate detection
        // We push a duplicate of the current valid state to act as a "guard" entry
        window.history.pushState(window.history.state, '', window.location.href);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Handle leaving the page via navigation
    // Handle leaving the page via navigation
    const confirmCancelBooking = async () => {
        setShowCancelModal(false);
        setIsLeaving(true); // Show loading spinner while canceling
        try {
            if (bookingId) {
                await BookingService.cancelBooking(bookingId);
            }
        } catch (err) {
            console.error('Failed to cancel booking:', err);
        } finally {
            navigate('/events');
        }
    };

    const handlePayment = async () => {
        // Placeholder for payment integration
        try {
            setLoading(true);

            // Simulate payment (replace with actual Razorpay/Stripe integration)
            const paymentId = `pay_${Date.now()}`;

            await BookingService.confirmBooking(bookingId!, {
                paymentId,
                paymentMethod: 'card'
            });

            alert('Payment successful! Your booking is confirmed.');
            navigate('/my-bookings');
        } catch (err: any) {
            console.error('Payment failed:', err);
            const message = err.response?.data?.message || 'Payment failed. Please try again.';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Show loading if user is leaving or if booking data is missing
    if (isLeaving) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Releasing seats...</p>
                </div>
            </div>
        );
    }

    if (!booking || !event) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full mb-4">
                        <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">The booking session has expired or is invalid.</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25"
                    >
                        Browse Events
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header with Timer */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete Payment</h1>
                    <p className="text-slate-600 dark:text-slate-400">Booking #{booking.bookingNumber}</p>

                    {/* Countdown Timer */}
                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${timeLeft < 60
                        ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        <span className="text-sm">remaining</span>
                    </div>
                </div>

                {/* Event Info */}
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-sm dark:shadow-none transition-colors duration-200">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{event.title}</h2>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <p>📍 {event.venue?.name || 'Venue TBD'}</p>
                        <p>📅 {new Date(event.eventDate).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </div>

                {/* Selected Seats */}
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-sm dark:shadow-none transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Selected Seats ({selectedSeats.length})</h3>
                    <div className="space-y-3">
                        {selectedSeats.map(seat => (
                            <div key={seat.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div>
                                    <span className="text-slate-900 dark:text-white font-medium">
                                        {seat.sectionName} - Row {seat.row} Seat {seat.number}
                                    </span>
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">₹{seat.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Amount</span>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Warning Notice */}
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-amber-800 dark:text-amber-200 font-medium">Your seats are temporarily reserved</p>
                            <p className="text-amber-600 dark:text-amber-300/70 text-sm mt-1">
                                Complete payment before the timer expires. If you leave this page, your seats will be released.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={loading}
                        className="flex-1 px-6 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={loading || timeLeft === 0}
                        className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Pay ₹{totalAmount.toFixed(2)}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Custom Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowCancelModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancel Booking?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                Are you sure you want to cancel? Your selected seats will be released immediately.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={confirmCancelBooking}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/25"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
