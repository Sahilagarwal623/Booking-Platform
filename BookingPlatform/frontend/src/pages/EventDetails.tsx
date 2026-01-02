import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EventService } from '../api/event.api';
import type { Event } from '../types/event.types';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const response = await EventService.getEvent(id);
                setEvent(response.data);
            } catch (err) {
                setError('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-6 w-32 rounded" />
                <div className="skeleton h-10 w-2/3 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
                    <div className="skeleton h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 glass rounded-2xl animate-scale-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-rose-500 mb-4">{error}</p>
                <Link to="/events" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors">
                    ← Back to Events
                </Link>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-16 glass rounded-2xl">
                <p className="text-slate-500 dark:text-slate-400 mb-4">Event not found</p>
                <Link to="/events" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors">
                    ← Back to Events
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Link */}
            <Link
                to="/events"
                className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
            >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Events
            </Link>

            {/* Banner Image */}
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 group bg-slate-100 dark:bg-slate-800">
                {event.bannerUrl || event.imageUrl ? (
                    <img
                        src={event.bannerUrl || event.imageUrl}
                        alt={event.title || event.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                        <svg className="w-24 h-24 text-emerald-300 dark:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/20 via-transparent to-transparent" />
            </div>

            {/* Header */}
            <div>
                {event.category && (
                    <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full mb-3 shadow-xs">
                        {event.category}
                    </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{event.title || event.name}</h1>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Event Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            About This Event
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
                    </div>

                    {/* Event Details */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Event Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-500 text-sm">Date</p>
                                    <p className="text-slate-900 dark:text-white font-medium">
                                        {new Date(event.eventDate).toLocaleDateString('en-IN', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-500 text-sm">Time</p>
                                    <p className="text-slate-900 dark:text-white font-medium">
                                        {event.gateOpenTime
                                            ? new Date(event.gateOpenTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                            : new Date(event.eventDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-500 text-sm">Venue</p>
                                    <p className="text-slate-900 dark:text-white font-medium">{event.venue?.name || 'TBD'}</p>
                                    {event.venue?.address && (
                                        <p className="text-slate-500 text-sm">{event.venue.address}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl">
                                    <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-500 text-sm">Capacity</p>
                                    <p className="text-slate-900 dark:text-white font-medium">{event.totalSeats} seats</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Panel */}
                <div className="lg:col-span-1">
                    <div className="glass rounded-2xl p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Book Tickets</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">Available Seats</span>
                                <span className="text-slate-900 dark:text-white font-medium">
                                    {event.availableSeats} / {event.totalSeats}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">Price</span>
                                <span className="gradient-text font-bold text-xl">
                                    {(() => {
                                        const multipliers = event.venue?.sections?.map(s => s.priceMultiplier) || [];
                                        if (multipliers.length > 0) {
                                            const minPrice = event.basePrice * Math.min(...multipliers);
                                            const maxPrice = event.basePrice * Math.max(...multipliers);
                                            return minPrice === maxPrice
                                                ? `₹${minPrice}`
                                                : `₹${minPrice} - ₹${maxPrice}`;
                                        }
                                        return `₹${event.basePrice}`;
                                    })()}
                                </span>
                            </div>

                        </div>

                        {user?.role !== 'ORGANIZER' && (
                            <button
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login', { state: { from: `/events/${id}` } });
                                        return;
                                    }
                                    navigate(`/events/${id}/book`);
                                }}
                                className="cursor-pointer w-full py-3.5 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
                            >
                                <span className="relative z-10">Book Now</span>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </button>
                        )}

                        <p className="text-slate-500 dark:text-slate-500 text-xs text-center mt-4 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Secure checkout • Instant confirmation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}