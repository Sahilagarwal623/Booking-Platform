
interface BookingBottomBarProps {
    selectedSeatsCount: number;
    totalAmount: number;
    onProceed: () => void;
    loading?: boolean;
}

export default function BookingBottomBar({
    selectedSeatsCount,
    totalAmount,
    onProceed,
    loading = false
}: BookingBottomBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Selected Seats</p>
                        <p className="text-slate-900 dark:text-white font-bold text-xl">{selectedSeatsCount}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Total Amount</p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">₹{totalAmount}</p>
                    </div>
                </div>

                <button
                    onClick={onProceed}
                    disabled={selectedSeatsCount === 0 || loading}
                    className={`
                        py-3 px-8 rounded-lg font-bold text-white shadow-lg transition-all duration-200
                        ${selectedSeatsCount === 0 || loading
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25 transform hover:-translate-y-0.5'
                        }
                    `}
                >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
            </div>
        </div>
    );
}
