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

            /* Custom styles for date and time input icons */
            .date-input-custom::-webkit-calendar-picker-indicator {
            background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23d6b33e' viewBox='0 0 16 16'%3e%3cpath d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z'/%3e%3c/svg%3e") no-repeat;
            background-position: center;
            cursor: pointer;
            }

            .time-input-custom::-webkit-calendar-picker-indicator {
            background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23d6b33e' viewBox='0 0 16 16'%3e%3cpath d='M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z'/%3e%3cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'/%3e%3c/svg%3e") no-repeat;
            background-position: center;
            cursor: pointer;
            }

            
        `}</style>
    );
};