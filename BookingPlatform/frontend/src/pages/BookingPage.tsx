import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../api/event.api';
import { BookingService } from '../api/booking.api';
import type { Event } from '../types/event.types';
import SeatGrid from '../components/booking/SeatGrid';
import BookingBottomBar from '../components/booking/BookingBottomBar';

interface Seat {
    id: string;
    row: string;
    number: number;
    price: number;
    status: 'AVAILABLE' | 'BOOKED' | 'HELD' | 'BLOCKED';
    isAvailable: boolean;
    sectionName?: string;
}

export default function BookingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [seatData, setSeatData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch event details and seat availability in parallel
                const [eventRes, seatsRes] = await Promise.all([
                    EventService.getEvent(id),
                    EventService.getSeatAvailability(id)
                ]);

                setEvent(eventRes.data);
                setSeatData(seatsRes.data);
            } catch (err) {
                setError('Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Auto-refresh seat data every 30 seconds to keep in sync
    useEffect(() => {
        if (!id) return;

        const refreshSeats = async () => {
            try {
                const seatsRes = await EventService.getSeatAvailability(id);
                setSeatData(seatsRes.data);

                // Clear any selected seats that are no longer available
                const newSeatData = seatsRes.data as any;
                setSelectedSeats(prev =>
                    prev.filter(selected => {
                        const seatStillAvailable = newSeatData.sections?.some((section: any) =>
                            section.seats.some((seat: any) =>
                                seat.id === selected.id && seat.status === 'AVAILABLE'
                            )
                        );
                        return seatStillAvailable;
                    })
                );
            } catch (err) {
                console.error('Failed to refresh seats:', err);
            }
        };

        const interval = setInterval(refreshSeats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [id]);


    // Handle seat click - local state only, no API calls
    // Seats are locked only when user proceeds to payment
    const handleSeatClick = (seat: Seat, sectionName: string) => {
        const isSelected = selectedSeats.find(s => s.id === seat.id);

        if (isSelected) {
            // Deselect seat (local state only)
            setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
        } else {
            // Select seat (local state only)
            // Max 6 seats per booking
            if (selectedSeats.length >= 6) {
                alert("You can only select up to 6 seats");
                return;
            }
            setSelectedSeats(prev => [...prev, { ...seat, sectionName }]);
        }
    };

    const handleProceed = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        try {
            setLoading(true);
            const seatIds = selectedSeats.map(s => s.id);

            // Step 1: Hold seats (locking happens here, not on click)
            await BookingService.holdSeats(id!, seatIds);

            // Step 2: Create booking
            const response = await BookingService.createBooking(id!, seatIds);
            console.log("Booking created:", response.data);

            // Step 3: Navigate to payment page with booking data
            navigate(`/bookings/${response.data.id}/payment`, {
                state: {
                    booking: response.data,
                    event: event,
                    selectedSeats: selectedSeats,
                }
            });
        } catch (err: any) {
            console.error('Booking failed:', err);
            const message = err.response?.data?.message || 'Failed to proceed. Some seats may no longer be available.';
            alert(message);

            // Refresh seat data to stay in sync
            const seatsRes = await EventService.getSeatAvailability(id!);
            setSeatData(seatsRes.data);
            setSelectedSeats([]); // Clear selection on failure
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading seat map...</p>
                </div>
            </div>
        );
    }

    if (error || !event || !seatData) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-slate-400 mb-6">{error || 'Event data not found'}</p>
                    <button
                        onClick={() => navigate(`/events/${id}`)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                        Return to Event Details
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <button
                            onClick={() => navigate(`/events/${id}`)}
                            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Event
                        </button>
                        <h1 className="text-3xl font-bold text-white mb-2">Select Seats</h1>
                        <p className="text-slate-400">{event.title || event.name} • {event.venue.name}</p>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 items-center bg-slate-900/50 px-6 py-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-slate-600"></div>
                            <span className="text-sm text-slate-300">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                            <span className="text-sm text-slate-300">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-slate-700 opacity-50"></div>
                            <span className="text-sm text-slate-500">Booked</span>
                        </div>
                    </div>
                </div>

                {/* Main Stage/Screen Indicator */}
                <div className="mb-12 relative">
                    <div className="w-3/4 mx-auto h-2 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent blur-sm rounded-full"></div>
                    <div className="w-3/4 mx-auto h-1 bg-linear-to-r from-transparent via-indigo-400 to-transparent rounded-full mt-[-6px]"></div>
                    <p className="text-center text-indigo-400/50 text-sm font-medium tracking-[0.2em] mt-4 uppercase">Stage / Screen</p>

                    {/* Perspective gradient for depth */}
                    <div className="absolute top-full left-0 right-0 h-32 bg-linear-to-b from-indigo-500/5 via-transparent to-transparent -z-10 pointer-events-none"></div>
                </div>

                {/* Seat Map */}
                <div className="w-full">
                    <SeatGrid
                        sections={seatData.sections}
                        selectedSeats={selectedSeats.map(s => s.id)}
                        onSeatClick={(seat) => {
                            // Find section name for this seat
                            const section = seatData.sections.find((sec: any) =>
                                sec.seats.some((s: any) => s.id === seat.id)
                            );
                            handleSeatClick(seat, section?.sectionName || 'Unknown');
                        }}
                    />
                </div>
            </div>

            <BookingBottomBar
                selectedSeatsCount={selectedSeats.length}
                totalAmount={totalAmount}
                onProceed={handleProceed}
            />
        </div>
    );
}
