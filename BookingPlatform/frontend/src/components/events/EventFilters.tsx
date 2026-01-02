import { useState, useEffect } from 'react';
import type { EventCategory } from '../../types/event.types';

interface EventFiltersProps {
    currentFilters: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        dateFrom?: string;
        dateTo?: string;
        city?: string;
    };
    onFilterChange: (filters: any) => void;
    onClear: () => void;
}

const CATEGORIES: { label: string; value: EventCategory; icon: string }[] = [
    { label: 'Movie', value: 'MOVIE', icon: '🎬' },
    { label: 'Concert', value: 'CONCERT', icon: '🎵' },
    { label: 'Sports', value: 'SPORTS', icon: '⚽' },
    { label: 'Theater', value: 'THEATER', icon: '🎭' },
    { label: 'Comedy', value: 'COMEDY', icon: '😄' },
    { label: 'Conference', value: 'CONFERENCE', icon: '💼' },
    { label: 'Other', value: 'OTHER', icon: '✨' },
];

export default function EventFilters({ currentFilters, onFilterChange, onClear }: EventFiltersProps) {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const [isApplying, setIsApplying] = useState(false);

    const handleChange = (key: string, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const handleApply = () => {
        if (isApplying) return;

        setIsApplying(true);
        onFilterChange(localFilters);

        // Disable button for 2 seconds to prevent spam
        setTimeout(() => {
            setIsApplying(false);
        }, 3000);
    };

    return (
        <div className="glass rounded-2xl p-6 space-y-6 animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
                </div>
                <button
                    onClick={onClear}
                    disabled={isApplying}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear All
                </button>
            </div>

            {/* Category */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <span>Category</span>
                </h3>
                <div className="space-y-2">
                    <label
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${!localFilters.category
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <input
                            type="radio"
                            name="category"
                            checked={!localFilters.category}
                            onChange={() => handleChange('category', undefined)}
                            className="sr-only"
                        />
                        <span className="text-lg">🌟</span>
                        <span className={`text-sm font-medium ${!localFilters.category ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            All Categories
                        </span>
                        {!localFilters.category && (
                            <svg className="w-4 h-4 text-emerald-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </label>
                    {CATEGORIES.map((cat) => (
                        <label
                            key={cat.value}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${localFilters.category === cat.value
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="category"
                                value={cat.value}
                                checked={localFilters.category === cat.value}
                                onChange={() => handleChange('category', cat.value)}
                                className="sr-only"
                            />
                            <span className="text-lg">{cat.icon}</span>
                            <span className={`text-sm font-medium ${localFilters.category === cat.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                {cat.label}
                            </span>
                            {localFilters.category === cat.value && (
                                <svg className="w-4 h-4 text-emerald-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={localFilters.minPrice || ''}
                            onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full pl-9! py-2.5 text-sm"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={localFilters.maxPrice || ''}
                            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full pl-9! py-2.5 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* City */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">City</h3>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter city"
                        value={localFilters.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full pl-9! py-2.5 text-sm"
                    />
                </div>
            </div>

            {/* Date Range */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Date Range</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-500 dark:text-slate-500 mb-1 block">From</label>
                        <input
                            type="date"
                            value={localFilters.dateFrom || ''}
                            onChange={(e) => handleChange('dateFrom', e.target.value)}
                            className="w-full py-2.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 dark:text-slate-500 mb-1 block">To</label>
                        <input
                            type="date"
                            value={localFilters.dateTo || ''}
                            onChange={(e) => handleChange('dateTo', e.target.value)}
                            className="w-full py-2.5 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Apply Button */}
            <button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 relative overflow-hidden group"
            >
                {isApplying ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Applying...
                    </>
                ) : (
                    <>
                        <span className="relative z-10">Apply Filters</span>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </>
                )}
            </button>
        </div>
    );
}
