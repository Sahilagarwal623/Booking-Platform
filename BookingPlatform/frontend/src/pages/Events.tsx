import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EventService } from '../api/event.api';
import type { Event } from '../types/event.types';

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await EventService.getEvents();
                setEvents(response.data.events);
            } catch (err) {
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Upcoming Events</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl h-80 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Upcoming Events</h1>
                <p className="text-slate-400">Discover and book your next experience</p>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400 text-lg">No events available</p>
                    <p className="text-slate-500 mt-2">Check back later for new events</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="group bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Image placeholder */}
                            <div className="h-44 bg-linear-to-br from-indigo-600/20 to-violet-600/20 flex items-center justify-center relative">
                                <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                {/* Category badge */}
                                {event.category && (
                                    <span className="absolute top-3 left-3 px-2 py-1 bg-slate-900/80 text-slate-300 text-xs font-medium rounded-md">
                                        {event.category}
                                    </span>
                                )}
                            </div>
                            {/* Content */}
                            <div className="p-5">
                                <h2 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">
                                    {event.name}
                                </h2>
                                <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                                    {event.description}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(event.date).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.venue?.name || 'Venue TBD'}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-indigo-400 font-semibold">
                                        ₹{event.minPrice} - ₹{event.maxPrice}
                                    </span>
                                    <span className="text-slate-500 text-sm group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                                        View Details
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}