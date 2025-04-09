import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabProps {
  value: string;
  tabs: { label: string; value: string; }[];
  onTabChange: (value: string) => void;
  className?: string;
}

export function Tab({ value, tabs, onTabChange, className }: TabProps) {
  return (
    <div className={cn("flex space-x-8 overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            "py-4 px-1 border-b-2 font-medium",
            tab.value === value
              ? "border-primary text-primary"
              : "border-transparent text-gray-400 hover:text-white"
          )}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
