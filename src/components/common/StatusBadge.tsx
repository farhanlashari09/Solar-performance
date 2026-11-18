import React from 'react';
import { DiagnosticStatus, ServiceStatus } from '../../types';

interface StatusBadgeProps {
  status: DiagnosticStatus | ServiceStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-medium';

  switch (status) {
    case 'Normal':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Normal Performance
        </span>
      );
    case 'Needs Attention':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Needs Attention
        </span>
      );
    case 'Possible System Issue':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Possible System Issue
        </span>
      );
    case 'Insufficient Data':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Insufficient Data
        </span>
      );
    case 'Requested':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Requested
        </span>
      );
    case 'Accepted':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Accepted
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          In Progress
        </span>
      );
    case 'Completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${pad}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Completed
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${pad}`}>
          {status}
        </span>
      );
  }
};
