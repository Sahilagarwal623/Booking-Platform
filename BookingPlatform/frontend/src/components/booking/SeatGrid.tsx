

// Types for props
interface Seat {
    id: string;
    row: string;
    number: number;
    price: number;
    status: 'AVAILABLE' | 'BOOKED' | 'HELD' | 'BLOCKED';
    isAvailable: boolean;
}

interface Section {
    sectionId: string;
    sectionName: string;
    priceMultiplier: number;
    seats: Seat[];
}

interface SeatGridProps {
    sections: Section[];
    selectedSeats: string[];
    onSeatClick: (seat: Seat) => void;
}

export default function SeatGrid({ sections, selectedSeats, onSeatClick }: SeatGridProps) {
    // Helper to group seats by row within a section
    const getRows = (seats: Seat[]) => {
        const rows: Record<string, Seat[]> = {};
        seats.forEach(seat => {
            if (!rows[seat.row]) {
                rows[seat.row] = [];
            }
            rows[seat.row].push(seat);
        });
        // Sort rows alphabetically
        return Object.keys(rows).sort().reduce((acc, key) => {
            acc[key] = rows[key].sort((a, b) => a.number - b.number);
            return acc;
        }, {} as Record<string, Seat[]>);
    };

    return (
        <div className="space-y-8">
            {sections.map(section => (
                <div key={section.sectionId} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 mb-8 shadow-sm dark:shadow-none transition-colors duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{section.sectionName}</h3>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                            Base Price x {section.priceMultiplier}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 overflow-x-auto pb-4">
                        {Object.entries(getRows(section.seats)).map(([rowLabel, seats]) => (
                            <div key={rowLabel} className="flex items-center gap-4 min-w-max mx-auto">
                                <div className="w-8 text-slate-500 font-medium text-center">{rowLabel}</div>
                                <div className="flex gap-2">
                                    {seats.map(seat => {
                                        const isSelected = selectedSeats.includes(seat.id);
                                        const isBooked = !seat.isAvailable;

                                        return (
                                            <button
                                                key={seat.id}
                                                disabled={isBooked}
                                                onClick={() => onSeatClick(seat)}
                                                className={`
                                                    w-8 h-8 rounded-t-lg text-xs font-medium transition-all duration-200
                                                    flex items-center justify-center relative group
                                                    ${isBooked
                                                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 translate-y-[-2px]'
                                                            : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                    }
                                                `}
                                                title={`Row ${seat.row} Seat ${seat.number} - ₹${seat.price}`}
                                            >
                                                {seat.number}

                                                {/* Tooltip */}
                                                {!isBooked && (
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-max pointer-events-none">
                                                        <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded border border-slate-700 shadow-xl">
                                                            ₹{seat.price}
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="w-8 text-slate-500 font-medium text-center">{rowLabel}</div>
                            </div>
                        ))}
                    </div>

                    {/* Screen Indicator */}

                </div>
            ))}
        </div>
    );
}
