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

const CATEGORIES: { label: string; value: EventCategory }[] = [
    { label: 'Movie', value: 'MOVIE' },
    { label: 'Concert', value: 'CONCERT' },
    { label: 'Sports', value: 'SPORTS' },
    { label: 'Theater', value: 'THEATER' },
    { label: 'Comedy', value: 'COMEDY' },
    { label: 'Conference', value: 'CONFERENCE' },
    { label: 'Other', value: 'OTHER' },
];

export default function EventFilters({ currentFilters, onFilterChange, onClear }: EventFiltersProps) {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const handleChange = (key: string, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        // Debounce for text/number inputs could be added here, 
        // but for now we'll trigger immediately or on blur/enter in a real app.
        // For simplicity, triggering on change for selects/radio, 
        // maybe add a "Apply" button or debounce for prices/dates if needed.
        // Let's trigger directly for category/city, but maybe delay for price typing if we wanted.
        // For now, consistent behavior:
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-8 sticky top-24 shadow-sm dark:shadow-none transition-colors duration-200">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
                <button
                    onClick={onClear}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                    Clear All
                </button>
            </div>

            {/* Category */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="category"
                            checked={!currentFilters.category}
                            onChange={() => handleChange('category', undefined)}
                            className="text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors"
                        />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">All Categories</span>
                    </label>
                    {CATEGORIES.map((cat) => (
                        <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value={cat.value}
                                checked={currentFilters.category === cat.value}
                                onChange={() => handleChange('category', cat.value)}
                                className="text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors"
                            />
                            <span className="text-slate-600 dark:text-slate-400 text-sm">{cat.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={localFilters.minPrice || ''}
                        onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={localFilters.maxPrice || ''}
                        onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* City */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">City</h3>
                <input
                    type="text"
                    placeholder="Enter city"
                    value={localFilters.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Date Range */}
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Date</h3>
                <div className="space-y-2">
                    <input
                        type="date"
                        value={localFilters.dateFrom || ''}
                        onChange={(e) => handleChange('dateFrom', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all scheme-light dark:scheme-dark"
                    />
                    <input
                        type="date"
                        value={localFilters.dateTo || ''}
                        onChange={(e) => handleChange('dateTo', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all scheme-light dark:scheme-dark"
                    />
                </div>
            </div>
        </div>
    );
}
