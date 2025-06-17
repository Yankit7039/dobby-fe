
import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = 'bg-gradient-to-br from-blue-50 to-blue-100',
  prefix = '',
  suffix = ''
}: StatCardProps) {
  const iconColorClass = color.includes('blue') ? 'text-blue-600' : 
                        color.includes('green') ? 'text-green-600' :
                        color.includes('purple') ? 'text-purple-600' :
                        color.includes('orange') ? 'text-orange-600' :
                        'text-blue-600';

  return (
    <div className="card hover-lift group cursor-pointer animate-scale-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
            {trend && trendValue && (
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                trend === 'up' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <svg 
                  className={`w-3 h-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {trendValue}
              </div>
            )}
          </div>
          <div className="flex items-baseline space-x-1">
            {prefix && <span className="text-xl font-semibold text-gray-500">{prefix}</span>}
            <p className="text-4xl font-bold text-gray-900 tabular-nums tracking-tight">
              {value.toLocaleString()}
            </p>
            {suffix && <span className="text-xl font-semibold text-gray-500 ml-1">{suffix}</span>}
          </div>
        </div>
        
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-all duration-300 shadow-sm`}>
          <div className={`w-8 h-8 ${iconColorClass} flex items-center justify-center transition-transform duration-300 group-hover:rotate-12`}>
            {icon}
          </div>
        </div>
      </div>
      
      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
    </div>
  );
}
