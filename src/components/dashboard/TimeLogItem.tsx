
import React from 'react';
import { FaClock, FaCalendarAlt, FaDollarSign, FaStopwatch } from 'react-icons/fa';
import { TimeLog } from '@/types/dashboard';

interface TimeLogItemProps {
  timeLog: TimeLog;
}

export default function TimeLogItem({ timeLog }: TimeLogItemProps) {
  const hours = timeLog.billable_hours || 0;
  const progressPercentage = Math.min((hours / 8) * 100, 100); // Assuming 8 hours is full day

  return (
    <div className="group relative">
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
            <FaClock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900 text-lg leading-tight">{timeLog.task_description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>{new Date(timeLog.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  {hours > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
                      <FaStopwatch className="w-3 h-3" />
                      <span>{hours}h logged</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress bar for hours */}
            {hours > 0 && (
              <div className="w-full">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Daily Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right space-y-1 ml-4">
          <div className="flex items-center space-x-1">
            <FaDollarSign className="w-4 h-4 text-green-600" />
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{timeLog.amount.toFixed(2)}</p>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
            Billable
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
}
