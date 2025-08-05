'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';

// --- Data and Conversion Helpers (No changes here) ---

const parse24HourTime = (time24: string) => {
    if (!time24 || !time24.includes(':')) {
        return { hour: '12', minute: '00', period: 'AM' };
    }
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;
    
    return {
        hour: String(hour12).padStart(2, '0'),
        minute: String(minutes).padStart(2, '0'),
        period,
    };
};

const formatTo24HourTime = (hour12: string, minute: string, period: 'AM' | 'PM'): string => {
    let hour = parseInt(hour12, 10);
    if (period === 'PM' && hour !== 12) {
        hour += 12;
    }
    if (period === 'AM' && hour === 12) {
        hour = 0;
    }
    return `${String(hour).padStart(2, '0')}:${minute}`;
};


export const CustomTimePicker = ({ value, onChange, name }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timePickerRef = useRef<HTMLDivElement>(null);
    const [displayTime, setDisplayTime] = useState(parse24HourTime(value));

    useEffect(() => {
        setDisplayTime(parse24HourTime(value));
    }, [value]);

    const timeOptions = useMemo(() => ({
        hours: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
        minutes: Array.from({ length: 60 / 15 }, (_, i) => String(i * 15).padStart(2, '0')),
        periods: ['AM', 'PM'],
    }), []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleApply = () => {
        const new24hValue = formatTo24HourTime(displayTime.hour, displayTime.minute, displayTime.period as 'AM'|'PM');
        const event = {
            target: { name, value: new24hValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setDisplayTime(parse24HourTime(value));
        setIsOpen(false);
    };
    
    const formattedDisplayValue = value ? `${displayTime.hour}:${displayTime.minute} ${displayTime.period}` : 'Select a time';

    return (
        <div className="relative" ref={timePickerRef}>
            {/* The main input display (already text-sm, no change needed) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 cursor-pointer flex justify-between items-center"
            >
                <span>{formattedDisplayValue}</span>
                <ClockIcon />
            </div>

            {/* The 3-Column Picker Dropdown */}
            {isOpen && (
                 <div className="absolute z-10 top-full mt-2 w-full bg-[#2a1f14] border border-amber-600/30 rounded-lg shadow-lg p-3 flex flex-col">
                    {/* MODIFIED: Reduced height from h-48 to h-40 */}
                    <div className="flex flex-row justify-center gap-2 h-40">
                        <TimeColumn options={timeOptions.hours} selectedValue={displayTime.hour} onSelect={(h) => setDisplayTime(t => ({...t, hour: h}))} />
                        <TimeColumn options={timeOptions.minutes} selectedValue={displayTime.minute} onSelect={(m) => setDisplayTime(t => ({...t, minute: m}))} />
                        <TimeColumn options={timeOptions.periods} selectedValue={displayTime.period} onSelect={(p) => setDisplayTime(t => ({...t, period: p}))} />
                    </div>
                    <div className="flex gap-3 mt-3 border-t border-amber-800/30 pt-3">
                        {/* MODIFIED: Changed text-sm to text-xs and p-2 to p-1.5 */}
                        <button onClick={handleCancel} className="w-full p-1.5 text-xs rounded-md text-amber-200 bg-amber-900/50 hover:bg-amber-900/80">Cancel</button>
                        <button onClick={handleApply} className="w-full p-1.5 text-xs rounded-md text-black bg-amber-500 hover:bg-amber-400 font-semibold">Apply</button>
                    </div>
                </div>
            )}
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

// --- Sub-components ---

const TimeColumn = ({ options, selectedValue, onSelect }: { options: string[], selectedValue: string, onSelect: (value: string) => void }) => {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const selectedElement = listRef.current?.querySelector(`[data-time-val="${selectedValue}"]`);
        selectedElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [selectedValue]);

    return (
        <ul ref={listRef} className="no-scrollbar flex-1 overflow-y-auto h-full text-center">
            {options.map(option => (
                <li
                    key={option}
                    data-time-val={option}
                    onClick={() => onSelect(option)}
                    className={clsx(
                        // MODIFIED: Added text-xs, changed padding and margin for a tighter fit
                        "p-1.5 my-0.5 cursor-pointer rounded-md text-amber-200 text-xs font-medium",
                        "hover:bg-amber-500/20",
                        { "bg-amber-500 text-black font-bold": selectedValue === option }
                    )}
                >
                    {option}
                </li>
            ))}
        </ul>
    );
};

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);