import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { EventService } from '../../api/event.api';
import { VenueService } from '../../api/venue.api';
import type { Venue, EventCategory } from '../../types/event.types';

const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
    { value: 'MOVIE', label: 'Movie' },
    { value: 'CONCERT', label: 'Concert' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'THEATER', label: 'Theater' },
    { value: 'COMEDY', label: 'Comedy' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'OTHER', label: 'Other' },
];

export default function EditEvent() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'MOVIE' as EventCategory,
        venueId: '',
        eventDate: '',
        eventTime: '',
        basePrice: '',
        imageUrl: '',
        termsConditions: '',
    });

    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch venues
                const venueResponse = await VenueService.getVenues({ limit: 100 });
                setVenues(venueResponse.data.venues);
                setLoadingVenues(false);

                // Fetch event details
                if (id) {
                    const eventResponse = await EventService.getEvent(id);
                    const event = eventResponse.data;

                    // Parse date and time from eventDate
                    const eventDateTime = new Date(event.eventDate);
                    const dateStr = eventDateTime.toISOString().split('T')[0];
                    const timeStr = eventDateTime.toTimeString().slice(0, 5);

                    setFormData({
                        title: event.title || '',
                        description: event.description || '',
                        category: (event.category || 'MOVIE') as EventCategory,
                        venueId: event.venue?.id || '',
                        eventDate: dateStr,
                        eventTime: timeStr,
                        basePrice: event.basePrice?.toString() || '',
                        imageUrl: event.imageUrl || '',
                        termsConditions: event.termsConditions || '',
                    });
                }
            } catch (err) {
                setError('Failed to load event data');
            } finally {
                setLoadingEvent(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Combine date and time into ISO string
            const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);

            await EventService.updateEvent(id!, {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                venueId: formData.venueId,
                eventDate: eventDateTime.toISOString(),
                basePrice: parseFloat(formData.basePrice),
                imageUrl: formData.imageUrl || undefined,
                termsConditions: formData.termsConditions || undefined,
            });

            navigate('/organizer');
        } catch (err) {
            setError('Failed to update event. Please check all fields and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingEvent) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
                to="/organizer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
                <p className="text-slate-400">Update your event details</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter event title"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Describe your event"
                                className="w-full resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                >
                                    {EVENT_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Base Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="basePrice"
                                    value={formData.basePrice}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="500"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Venue & Date */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Venue & Schedule</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Venue *
                            </label>
                            {loadingVenues ? (
                                <div className="w-full h-11 bg-slate-800 rounded-lg animate-pulse" />
                            ) : venues.length === 0 ? (
                                <p className="text-slate-500 text-sm">No venues available.</p>
                            ) : (
                                <select
                                    name="venueId"
                                    value={formData.venueId}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                >
                                    <option value="">Select a venue</option>
                                    {venues.map(venue => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name} - {venue.city}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Event Date *
                                </label>
                                <input
                                    type="date"
                                    name="eventDate"
                                    value={formData.eventDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Event Time *
                                </label>
                                <input
                                    type="time"
                                    name="eventTime"
                                    value={formData.eventTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optional Fields */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Additional Details (Optional)</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Terms & Conditions
                            </label>
                            <textarea
                                name="termsConditions"
                                value={formData.termsConditions}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter any terms and conditions for the event"
                                className="w-full resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading || venues.length === 0}
                        className="flex-1 py-3 px-4 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                    <Link
                        to="/organizer"
                        className="px-6 py-3 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
