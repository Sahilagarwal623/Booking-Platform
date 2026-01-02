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
            <div className="space-y-6">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                    <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
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
                <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                <Link to="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors">
                    ← Back to Events
                </Link>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500 dark:text-slate-400 mb-4">Event not found</p>
                <Link to="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors">
                    ← Back to Events
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                to="/events"
                className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Events
            </Link>

            {/* Banner Image */}
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8 group bg-slate-100 dark:bg-slate-800">
                {event.bannerUrl || event.imageUrl ? (
                    <img
                        src={event.bannerUrl || event.imageUrl}
                        alt={event.title || event.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
                        <svg className="w-24 h-24 text-slate-400 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 via-transparent to-transparent opacity-60 dark:from-slate-950" />
            </div>

            {/* Header */}
            <div>
                {event.category && (
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-medium rounded-full mb-3 shadow-xs">
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
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About This Event</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
                    </div>

                    {/* Event Details */}
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Event Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-medium">
                                        {event.gateOpenTime
                                            ? new Date(event.gateOpenTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                            : new Date(event.eventDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        </div>
                    </div>
                </div>

                {/* Booking Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sticky top-24 shadow-sm dark:shadow-none transition-colors duration-200">
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
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
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
                                className="cursor-pointer w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200"
                            >
                                Book Now
                            </button>
                        )}

                        <p className="text-slate-500 dark:text-slate-500 text-xs text-center mt-4">
                            Secure checkout • Instant confirmation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}