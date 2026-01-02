import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EventService } from '../../api/event.api';
import type { Event } from '../../types/event.types';

export default function OrganizerDashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch all events (not just published) for organizer dashboard
                const response = await EventService.getEvents({ limit: 50, status: 'all' });
                setEvents(response.data.events);
            } catch (err) {
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handlePublish = async (eventId: string) => {
        try {
            await EventService.publishEvent(eventId);
            setEvents(events.map(e =>
                e.id === eventId ? { ...e, status: 'PUBLISHED' as const } : e
            ));
        } catch (err) {
            alert('Failed to publish event');
        }
    };

    const handleCancel = async (eventId: string) => {
        if (!confirm('Are you sure you want to cancel this event?')) return;
        try {
            await EventService.cancelEvent(eventId);
            setEvents(events.map(e =>
                e.id === eventId ? { ...e, status: 'CANCELLED' as const } : e
            ));
        } catch (err) {
            alert('Failed to cancel event');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
            case 'DRAFT':
                return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
            case 'CANCELLED':
                return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
            case 'COMPLETED':
                return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
            default:
                return 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Organizer Dashboard</h1>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-32 rounded-xl" />
                    ))}
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
                <p className="text-rose-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Organizer Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your events and track performance</p>
                </div>
                <Link
                    to="/organizer/events/new"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Events</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{events.length}</p>
                </div>
                <div className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Published</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {events.filter(e => e.status === 'PUBLISHED').length}
                    </p>
                </div>
                <div className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Drafts</p>
                    </div>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {events.filter(e => e.status === 'DRAFT').length}
                    </p>
                </div>
                <div className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Cancelled</p>
                    </div>
                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                        {events.filter(e => e.status === 'CANCELLED').length}
                    </p>
                </div>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-lg font-medium mb-2">No events yet</p>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first event to get started</p>
                    <Link
                        to="/organizer/events/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Event
                    </Link>
                </div>
            ) : (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Events</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {events.map((event, index) => (
                            <div
                                key={event.id}
                                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {event.name || event.title}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(event.eventDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {event.venue?.name || 'No venue'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Link
                                            to={`/events/${event.id}`}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            View
                                        </Link>
                                        {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                                            <Link
                                                to={`/organizer/events/${event.id}/edit`}
                                                className="px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 rounded-lg transition-colors"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {event.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handlePublish(event.id)}
                                                className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        {event.status === 'PUBLISHED' && (
                                            <button
                                                onClick={() => handleCancel(event.id)}
                                                className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
