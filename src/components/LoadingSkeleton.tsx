import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function LoadingSkeleton({ className = '', lines = 1, height = 'h-4' }: LoadingSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded ${height} ${
            index > 0 ? 'mt-2' : ''
          }`}
        />
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <LoadingSkeleton height="h-4" className="w-3/4" />
            <LoadingSkeleton height="h-3" className="w-1/2 mt-2" />
          </div>
        </div>
        <LoadingSkeleton lines={2} className="space-y-2" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      <div className="p-6 border-b border-slate-200">
        <LoadingSkeleton height="h-6" className="w-1/3" />
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <LoadingSkeleton key={colIndex} height="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
