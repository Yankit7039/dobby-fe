
import React from 'react';

interface ActivityCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function ActivityCard({ title, children, action, subtitle, icon }: ActivityCardProps) {
  return (
    <div className="card card-elevated animate-slide-in group">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <div className="w-5 h-5 text-blue-600">
                {icon}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      
      <div className="space-y-5">
        {children}
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
