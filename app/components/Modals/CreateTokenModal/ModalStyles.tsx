'use client';
import React from 'react';

export const ModalStyles = () => {
    return (
        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #2a1f14;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #d97706;
                border-radius: 10px;
                border: 2px solid #2a1f14;
            }
            .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #d97706 #2a1f14;
            }
            
            /* Custom styles for date input */
            .date-input-custom::-webkit-calendar-picker-indicator {
                filter: invert(0.8) sepia(1) saturate(5) hue-rotate(20deg) brightness(0.8);
                cursor: pointer;
                opacity: 0.7;
            }
            
            .date-input-custom::-webkit-calendar-picker-indicator:hover {
                opacity: 1;
            }
            
            /* Custom styles for time input */
            .time-input-custom::-webkit-calendar-picker-indicator {
                filter: invert(0.8) sepia(1) saturate(5) hue-rotate(20deg) brightness(0.8);
                cursor: pointer;
                opacity: 0.7;
            }
            
            .time-input-custom::-webkit-calendar-picker-indicator:hover {
                opacity: 1;
            }
            
            /* Override default focus styles */
            input[type="date"]:focus, input[type="time"]:focus {
                color: #fcd34d;
                border-color: #d97706;
            }
            
            /* For Firefox */
            input[type="date"], input[type="time"] {
                color-scheme: dark;
            }
        `}</style>
    );
};