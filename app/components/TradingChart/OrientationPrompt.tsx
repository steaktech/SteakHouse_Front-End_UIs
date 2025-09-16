"use client";

import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface OrientationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onContinuePortrait: () => void;
}

/**
 * Modal component that prompts users to rotate their device to landscape mode
 * for optimal chart viewing experience
 */
export const OrientationPrompt: React.FC<OrientationPromptProps> = ({
  isOpen,
  onClose,
  onContinuePortrait,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
        {/* Modal Content */}
        <div className="bg-gradient-to-br from-[#472303] to-[#5a2d04] rounded-2xl border border-[#daa20b]/40 shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors z-10"
            type="button"
          >
            <X size={18} className="text-[#daa20b]" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-[#daa20b]/20 border border-[#daa20b]/40">
                <RotateCcw size={48} className="text-[#daa20b] animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#daa20b] mb-3 tracking-[0.2px]">
              Rotate Your Device
            </h2>

            {/* Description */}
            <p className="text-[#e6d4a3]/80 text-sm leading-relaxed mb-6">
              For the best trading chart experience, please rotate your device to landscape mode. 
              This will give you a larger view of the chart with enhanced controls.
            </p>

            {/* Visual Hint */}
            <div className="mb-6 flex justify-center items-center gap-4">
              <div className="w-8 h-12 bg-[#daa20b]/30 rounded border border-[#daa20b]/50 flex items-center justify-center">
                <div className="w-3 h-6 bg-[#daa20b] rounded-sm"></div>
              </div>
              <RotateCcw size={20} className="text-[#daa20b] animate-spin" style={{animationDuration: '2s'}} />
              <div className="w-12 h-8 bg-[#daa20b]/30 rounded border border-[#daa20b]/50 flex items-center justify-center">
                <div className="w-6 h-3 bg-[#daa20b] rounded-sm"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onContinuePortrait}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#a3580f] to-[#daa20b] text-[#2b1200] font-semibold rounded-lg hover:from-[#b86610] hover:to-[#e6b020] transition-all duration-200 shadow-lg"
                type="button"
              >
                Continue in Portrait Mode
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-transparent border border-[#daa20b]/40 text-[#daa20b] font-medium rounded-lg hover:bg-[#daa20b]/10 transition-all duration-200"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
