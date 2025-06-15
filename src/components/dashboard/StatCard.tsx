import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: string; // e.g. "+12.3%"
  changeColor?: string; // e.g. "bg-green-100 text-green-700"
}

export default function StatCard({ icon, value, label, change, changeColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-5 flex flex-col relative min-w-[150px] max-w-full">
      {change && (
        <span
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${changeColor || "bg-green-100 text-green-700"}`}
        >
          {change}
        </span>
      )}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 mb-3 text-xl">
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 mb-0.5">{value}</div>
      <div className="text-gray-500 font-medium text-base leading-tight">{label}</div>
    </div>
  );
} 