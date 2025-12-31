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
                const response = await EventService.getEvents({ limit: 50 });
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
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'DRAFT':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'COMPLETED':
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Organizer Dashboard</h1>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl h-32 animate-pulse" />
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
                    <p className="text-slate-400">Manage your events</p>
                </div>
                <Link
                    to="/organizer/events/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-slate-400 text-sm mb-1">Total Events</p>
                    <p className="text-2xl font-bold text-white">{events.length}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-slate-400 text-sm mb-1">Published</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {events.filter(e => e.status === 'PUBLISHED').length}
                    </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-slate-400 text-sm mb-1">Drafts</p>
                    <p className="text-2xl font-bold text-amber-400">
                        {events.filter(e => e.status === 'DRAFT').length}
                    </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-slate-400 text-sm mb-1">Cancelled</p>
                    <p className="text-2xl font-bold text-red-400">
                        {events.filter(e => e.status === 'CANCELLED').length}
                    </p>
                </div>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400 text-lg mb-2">No events yet</p>
                    <p className="text-slate-500 mb-6">Create your first event to get started</p>
                    <Link
                        to="/organizer/events/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                    >
                        Create Event
                    </Link>
                </div>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h2 className="text-lg font-semibold text-white">Your Events</h2>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {events.map((event) => (
                            <div key={event.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                {event.name || event.title}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(event.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {event.venue?.name || 'No venue'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/events/${event.id}`}
                                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
                                        >
                                            View
                                        </Link>
                                        {event.status === 'DRAFT' && (
                                            <button
                                                onClick={() => handlePublish(event.id)}
                                                className="px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg transition-colors"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        {event.status === 'PUBLISHED' && (
                                            <button
                                                onClick={() => handleCancel(event.id)}
                                                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors"
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
