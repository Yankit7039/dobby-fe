'use client';

// import Link from 'next/link';
// import { TimeLog } from '@/types/dashboard';
import { ReactNode } from 'react';

export interface ActivityCardProps {
  title: string;
  children: ReactNode;
}

export default function ActivityCard({ title, children }: ActivityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
} 