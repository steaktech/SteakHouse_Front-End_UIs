import React from 'react';

export const TokenCardSkeleton = () => {
    return (
        <div className="w-full max-w-sm bg-[#1a0f08] border border-[#c87414]/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(200,116,20,0.15)] relative flex flex-col h-full animate-pulse">

            {/* Header Image Area Skeleton */}
            <div className="h-32 w-full bg-[#2b1200]/40 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-8 h-8 bg-[#2b1200]/60 rounded-lg"></div>
                    <div className="w-8 h-8 bg-[#2b1200]/60 rounded-lg"></div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-5 pb-6 relative -mt-10 flex-1 flex flex-col">

                {/* Avatar & Socials Row */}
                <div className="flex justify-between items-end mb-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-xl bg-[#1a0f08] border-2 border-[#c87414]/30 p-1">
                            <div className="w-full h-full bg-[#2b1200]/60 rounded-lg"></div>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-1">
                        <div className="w-8 h-8 bg-[#2b1200]/60 rounded-lg"></div>
                        <div className="w-8 h-8 bg-[#2b1200]/60 rounded-lg"></div>
                        <div className="w-8 h-8 bg-[#2b1200]/60 rounded-lg"></div>
                    </div>
                </div>

                {/* Title & Description */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-32 bg-[#2b1200]/60 rounded"></div>
                        <div className="h-5 w-16 bg-[#2b1200]/60 rounded"></div>
                    </div>

                    <div className="flex gap-2 mb-3">
                        <div className="h-6 w-16 bg-[#2b1200]/60 rounded"></div>
                        <div className="h-6 w-16 bg-[#2b1200]/60 rounded"></div>
                    </div>

                    <div className="space-y-1">
                        <div className="h-3 w-full bg-[#2b1200]/60 rounded"></div>
                        <div className="h-3 w-3/4 bg-[#2b1200]/60 rounded"></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="h-12 bg-[#2b1200]/60 rounded"></div>
                    <div className="h-12 bg-[#2b1200]/60 rounded"></div>
                    <div className="h-12 bg-[#2b1200]/60 rounded"></div>
                </div>

                {/* Progress & Button */}
                <div className="space-y-2 mt-auto">
                    <div className="flex justify-between">
                        <div className="h-3 w-20 bg-[#2b1200]/60 rounded"></div>
                        <div className="h-3 w-20 bg-[#2b1200]/60 rounded"></div>
                    </div>

                    <div className="h-8 w-full bg-[#2b1200]/60 rounded-full"></div>

                    <div className="h-10 w-full bg-[#2b1200]/60 rounded-lg mt-3"></div>
                </div>
            </div>
        </div>
    );
};
