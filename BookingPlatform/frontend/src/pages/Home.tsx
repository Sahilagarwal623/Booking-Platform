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
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="relative text-center py-20 md:py-32 overflow-hidden">
                {/* Decorative floating shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Floating circles */}
                    <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-2 border-emerald-500/20 animate-float" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-32 right-20 w-12 h-12 rounded-full bg-linear-to-br from-amber-400/30 to-orange-400/30 blur-sm animate-float-slow" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full border-2 border-teal-500/20 animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute bottom-32 right-1/4 w-24 h-24 rounded-full bg-linear-to-br from-emerald-500/20 to-cyan-500/20 blur-md animate-float-slow" style={{ animationDelay: '3s' }} />

                    {/* Decorative lines */}
                    <div className="absolute top-1/2 left-0 w-32 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />
                    <div className="absolute top-1/3 right-0 w-40 h-px bg-linear-to-l from-transparent via-teal-500/30 to-transparent" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 animate-fade-in">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full mb-6 animate-bounce-subtle">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            New events added weekly
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="gradient-text animate-gradient-shift bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500">
                            Discover & Book
                        </span>
                        <br />
                        <span className="text-slate-900 dark:text-white">
                            Amazing Events
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        Find and book tickets for concerts, sports, theater, and more.
                        <span className="block mt-2 text-lg text-slate-500 dark:text-slate-500">
                            Your next unforgettable experience is just a click away.
                        </span>
                    </p>

                    {/* CTA Buttons */}
                    {isAuthenticated ? (
                        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
                                Welcome back, <span className="gradient-text font-semibold">{user?.name}</span>! Ready to explore?
                            </p>
                            <Link
                                to="/events"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-lg rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1 animate-glow-pulse"
                            >
                                Browse Events
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <Link
                                to="/register"
                                className="group relative px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-lg rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started Free
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-4 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:-translate-y-1"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 md:gap-16 mt-16 pt-16 border-t border-slate-200 dark:border-slate-800 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        {[
                            { value: '10K+', label: 'Events' },
                            { value: '50K+', label: 'Users' },
                            { value: '100K+', label: 'Tickets Sold' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Events */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            Featured Events
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Don't miss out on these popular experiences
                        </p>
                    </div>
                    <Link
                        to="/events"
                        className="group flex items-center gap-2 px-5 py-2.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        View All
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-80 rounded-2xl" />
                        ))}
                    </div>
                ) : featuredEvents.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl animate-fade-in">
                        <svg className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No events available at the moment</p>
                        <p className="text-slate-400 dark:text-slate-500 mt-2">Check back soon for exciting new events!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredEvents.map((event, index) => (
                            <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                className={`group card-hover glass rounded-2xl overflow-hidden animate-slide-up stagger-${index + 1}`}
                            >
                                {/* Image */}
                                <div className="h-48 bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-600/20 dark:to-teal-600/20 flex items-center justify-center overflow-hidden relative">
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <svg className="w-16 h-16 text-emerald-300 dark:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    )}
                                    {/* Category Badge */}
                                    {event.category && (
                                        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg backdrop-blur-sm">
                                            {event.category}
                                        </span>
                                    )}
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-1">
                                        {event.name || event.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(event.eventDate).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-lg font-bold gradient-text">
                                            From ₹{(() => {
                                                const multipliers = event.venue?.sections?.map(s => s.priceMultiplier) || [];
                                                return multipliers.length ? event.basePrice * Math.min(...multipliers) : event.basePrice;
                                            })()}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            Book Now
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}