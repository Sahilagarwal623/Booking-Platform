import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EventService } from '../api/event.api';
import type { Event } from '../types/event.types';

export default function Home() {
    const { user, isAuthenticated } = useAuth();
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedEvents = async () => {
            try {
                const response = await EventService.getEvents({ limit: 3 });
                setFeaturedEvents(response.data.events);
            } catch (err) {
                console.error('Failed to load featured events');
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedEvents();
    }, []);

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center py-16 md:py-24">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                        Discover & Book
                    </span>
                    <br />
                    <span className="text-white">Amazing Events</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                    Find and book tickets for concerts, sports, theater, and more.
                    Your next unforgettable experience is just a click away.
                </p>

                {isAuthenticated ? (
                    <p className="text-lg text-slate-300">
                        Welcome back, <span className="text-indigo-400 font-medium">{user?.name}</span>! Ready to explore?
                    </p>
                ) : (
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-3 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-white font-medium rounded-lg"
                        >
                            Login
                        </Link>
                    </div>
                )}
            </section>

            {/* Featured Events */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Events</h2>
                    <Link to="/events" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                        View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-slate-800/50 rounded-xl h-72 animate-pulse" />
                        ))}
                    </div>
                ) : featuredEvents.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl">
                        <p className="text-slate-400">No events available at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredEvents.map((event) => (
                            <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                className="group bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300"
                            >
                                {/* Image placeholder */}
                                <div className="h-40 bg-linear-to-br from-indigo-600/20 to-violet-600/20 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors mb-2">
                                        {event.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-3">
                                        {new Date(event.date).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </p>
                                    <p className="text-indigo-400 font-semibold">
                                        From ₹{event.minPrice}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}