import { TimeLog } from '@/types/dashboard';

interface TimeLogItemProps {
  timeLog: TimeLog;
}

export default function TimeLogItem({ timeLog }: TimeLogItemProps) {
  return (
    <div className="border p-4 rounded-lg">
      <p className="font-semibold">{timeLog.task_description}</p>
      <p className="text-gray-600">Status: {timeLog.status}</p>
      <p className="text-gray-600">Amount: ${timeLog.amount}</p>
      <p className="text-gray-600">Date: {new Date(timeLog.date).toLocaleDateString()}</p>
      {timeLog.billable_hours && (
        <p className="text-gray-600">Billable Hours: {timeLog.billable_hours}</p>
      )}
    </div>
  );
} 