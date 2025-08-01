'use client';
import React, { FC } from 'react';
import { InfoIcon } from './InfoIcon';

interface LaunchDateTimeSectionProps {
    formData: {
        launchDate: string;
        launchTime: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LaunchDateTimeSection: FC<LaunchDateTimeSectionProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
            <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
                🚀 Launch DateTime
                <InfoIcon 
                    title="🚀 Launch DateTime"
                    content="Set when your token will launch on the bonding curve. You can schedule it for immediate launch or set a future date and time for a coordinated release."
                />
            </h3>
            <div className="w-full md:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-amber-300/80 font-medium">Launch Date</label>
                        <input
                            type="date"
                            name="launchDate"
                            value={formData.launchDate}
                            onChange={handleInputChange}
                            className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 date-input-custom"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-amber-300/80 font-medium">Launch Time</label>
                        <input
                            type="time"
                            name="launchTime"
                            value={formData.launchTime}
                            onChange={handleInputChange}
                            className="bg-[#2a1f14] border border-amber-600/30 text-amber-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 time-input-custom"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};