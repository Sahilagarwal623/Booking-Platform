import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EventService } from '../api/event.api';
import type { Event } from '../types/event.types';
import EventFilters from '../components/events/EventFilters';

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({});

    const fetchEvents = async (currentFilters = {}) => {
        setLoading(true);
        try {
            const response = await EventService.getEvents(currentFilters);
            setEvents(response.data.events);
        } catch (err) {
            setError('Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        fetchEvents(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
        fetchEvents({});
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-linear-to-b from-emerald-500 to-teal-500 rounded-full" />
                <div className="pl-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Upcoming Events
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Discover and book your next unforgettable experience
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <EventFilters
                            currentFilters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={handleClearFilters}
                        />
                    </div>
                </div>

                {/* Events Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="skeleton h-80 rounded-2xl" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 glass rounded-2xl animate-scale-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full mb-4">
                                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-rose-500 font-medium mb-6">{error}</p>
                            <button
                                onClick={() => {
                                    setError('');
                                    fetchEvents(filters);
                                }}
                                className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Try Again
                            </button>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-16 glass rounded-2xl animate-fade-in">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <svg className="w-10 h-10 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">No events found</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your filters</p>
                            <button
                                onClick={handleClearFilters}
                                className="mt-6 px-5 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {events.map((event, index) => (
                                <Link
                                    key={event.id}
                                    to={`/events/${event.id}`}
                                    className={`group card-hover glass rounded-2xl overflow-hidden h-full flex flex-col animate-slide-up`}
                                    style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                                >
                                    {/* Image */}
                                    <div className="h-44 bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-600/20 dark:to-teal-600/20 flex items-center justify-center relative shrink-0 overflow-hidden">
                                        {event.imageUrl ? (
                                            <img
                                                src={event.imageUrl}
                                                alt={event.title || event.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <svg className="w-16 h-16 text-emerald-300 dark:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                        )}

                                        {/* Category badge */}
                                        {event.category && (
                                            <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg backdrop-blur-sm shadow-sm">
                                                {event.category}
                                            </span>
                                        )}

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                            <span className="text-white text-sm font-medium flex items-center gap-1">
                                                View Details
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-1">
                                            {event.title || event.name}
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                                            {event.description}
                                        </p>

                                        <div className="space-y-2 text-sm mt-auto">
                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <span>
                                                    {new Date(event.eventDate).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {/* Venue */}
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <span className="truncate">{event.venue?.name || 'Venue TBD'}</span>
                                            </div>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-lg font-bold gradient-text">
                                                ₹{(() => {
                                                    const multipliers = event.venue?.sections?.map(s => s.priceMultiplier) || [];
                                                    return multipliers.length ? event.basePrice * Math.min(...multipliers) : event.basePrice;
                                                })()}
                                            </span>
                                            <span className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-500 transition-all duration-300">
                                                Book Now
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}