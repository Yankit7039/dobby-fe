interface TimeLog {
  id: string;
  task_description: string;
  status: string;
  billable_hours: number | null;
  amount: number;
  date: string;
}

export default function TimeLogItem({ log }: { log: TimeLog }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {log.task_description}
        </p>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <span className="truncate">
            {log.billable_hours ? `${log.billable_hours} hours` : 'N/A'} • ${log.amount.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
          log.status === 'completed' ? 'bg-green-100 text-green-800' :
          log.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {log.status}
        </span>
      </div>
    </div>
  );
} 