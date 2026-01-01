import { Link } from 'react-router-dom';

interface Seat {
    id: string;
    row: string;
    number: number;
    price: number;
    status: 'AVAILABLE' | 'BOOKED' | 'HELD' | 'BLOCKED';
    sectionName?: string;
}

interface BookingSummaryProps {
    eventName: string;
    eventDate: string;
    venueName: string;
    selectedSeats: Seat[];
    onProceed: () => void;
    loading?: boolean;
}

export default function BookingSummary({
    eventName,
    eventDate,
    venueName,
    selectedSeats,
    onProceed,
    loading = false
}: BookingSummaryProps) {
    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>

            {/* Event Info */}
            <div className="space-y-4 mb-6 pb-6 border-b border-slate-800">
                <div>
                    <h3 className="text-slate-400 text-sm mb-1">Event</h3>
                    <p className="text-white font-medium">{eventName}</p>
                </div>
                <div>
                    <h3 className="text-slate-400 text-sm mb-1">Date & Time</h3>
                    <p className="text-white font-medium">
                        {new Date(eventDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div>
                    <h3 className="text-slate-400 text-sm mb-1">Venue</h3>
                    <p className="text-white font-medium">{venueName}</p>
                </div>
            </div>

            {/* Selected Seats */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-slate-400 text-sm">Selected Seats</h3>
                    <span className="text-indigo-400 text-sm font-medium">{selectedSeats.length} seats</span>
                </div>

                {selectedSeats.length === 0 ? (
                    <div className="text-slate-600 text-sm italic text-center py-4 bg-slate-950/30 rounded-lg">
                        No seats selected
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedSeats.map(seat => (
                            <div key={seat.id} className="flex justify-between items-center text-sm bg-slate-800/30 px-3 py-2 rounded">
                                <span className="text-slate-300">
                                    {seat.sectionName} - {seat.row}{seat.number}
                                </span>
                                <span className="text-white font-medium">₹{seat.price}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-800">
                <span className="text-lg font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-indigo-400">₹{totalAmount}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={onProceed}
                    disabled={selectedSeats.length === 0 || loading}
                    className={`
                        w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg transition-all duration-200
                        ${selectedSeats.length === 0 || loading
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25'
                        }
                    `}
                >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>

                <Link
                    to="#"
                    className="block w-full text-center py-2 text-slate-500 hover:text-slate-400 text-sm transition-colors"
                >
                    Cancel Booking
                </Link>
            </div>
        </div>
    );
}
