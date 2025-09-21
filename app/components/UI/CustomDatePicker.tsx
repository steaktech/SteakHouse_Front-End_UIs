'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { clsx } from 'clsx'; // A tiny utility for constructing className strings conditionally

// Helper to get the number of days in a month
const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
// Helper to get the first day of the month (0=Sun, 1=Mon, etc.)
const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export const CustomDatePicker = ({ value, onChange, name }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Use the provided value to initialize the date, or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [displayDate, setDisplayDate] = useState(initialDate);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Close calendar if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const calendarGrid = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const numDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        const emptyCells = Array(firstDay).fill(null);
        const dayCells = Array.from({ length: numDays }, (_, i) => i + 1);

        return { emptyCells, dayCells, year, month };
    }, [displayDate]);
    
    const handleDateSelect = (day: number) => {
        const selected = new Date(calendarGrid.year, calendarGrid.month, day);
        // Format to YYYY-MM-DD for consistency with <input type="date">
        const formattedDate = selected.toISOString().split('T')[0];

        // Create a synthetic event object to pass to the parent handler
        const event = {
            target: { name, value: formattedDate }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(event);
        setIsOpen(false);
    };

    const changeMonth = (offset: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };

    const selectedDate = value ? new Date(value) : null;

    return (
        <div className="relative" ref={datePickerRef}>
            {/* The main input display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 cursor-pointer flex justify-between items-center"
            >
                <span>{value || 'Select a date'}</span>
                <CalendarIcon />
            </div>

            {/* The Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-full bg-[#2a1f14] border border-amber-600/30 rounded-lg shadow-lg p-4">
                    {/* Header: Month/Year and Navigation */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-amber-500/20">
                            <ChevronLeftIcon />
                        </button>
                        <span className="font-semibold text-amber-200">
                            {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-amber-500/20">
                           <ChevronRightIcon />
                        </button>
                    </div>

                    {/* Grid: Day Names and Dates */}
                    <div className="grid grid-cols-7 text-center text-xs text-amber-300/70">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="py-2">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 text-center text-sm text-amber-200">
                        {calendarGrid.emptyCells.map((_, i) => <div key={`empty-${i}`} />)}
                        {calendarGrid.dayCells.map(day => {
                             const isSelected = selectedDate && 
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === calendarGrid.month &&
                                selectedDate.getFullYear() === calendarGrid.year;
                                
                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDateSelect(day)}
                                    className={clsx(
                                        "p-2 rounded-full cursor-pointer flex items-center justify-center aspect-square",
                                        "hover:bg-amber-500/30",
                                        { "bg-amber-500 text-black font-bold": isSelected }
                                    )}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// SVG Icon Components (can be in their own files)
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#d97706', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);