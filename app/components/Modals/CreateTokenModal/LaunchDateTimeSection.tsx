"use client";
import React, { FC } from "react";
import { InfoIcon } from "./InfoIcon";
import { CustomDatePicker } from "@/app/components/UI/CustomDatePicker"; // Import new component
import { CustomTimePicker } from "@/app/components/UI/CustomTimePicker"; // Import new component
import Image from 'next/image';

interface LaunchDateTimeSectionProps {
  formData: {
    launchDate: string; // Should be in "YYYY-MM-DD" format
    launchTime: string; // Should be in "HH:mm" format
  };
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export const LaunchDateTimeSection: FC<LaunchDateTimeSectionProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 border-t border-amber-800/30 pt-6">
      <h3 className="font-bold text-amber-300/90 w-full md:w-1/4 text-lg whitespace-pre-wrap flex items-start">
        <Image
          src="/images/modal-icons/rocket-website-webp.webp"
          alt="Token Type"
          width={38}
          height={38}
          className="inline-block"
        />
        Launch DateTime
        <span className="mt-1 md:mt-8">
        <InfoIcon
          title="Launch DateTime"
          content="Set when your token will launch on the bonding curve. You can schedule it for immediate launch or set a future date and time for a coordinated release."
        />
        </span>
      </h3>
      <div className="w-full md:w-3/4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date Picker Component */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-amber-300/80 font-medium">
              Launch Date
            </label>
            <CustomDatePicker
              name="launchDate"
              value={formData.launchDate}
              onChange={handleInputChange}
            />
          </div>

          {/* Time Picker Component */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-amber-300/80 font-medium">
              Launch Time
            </label>
            <CustomTimePicker
              name="launchTime"
              value={formData.launchTime}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
