import React from 'react';
export function Skeleton({ className }) {
  return <div className={className + ' bg-gray-200 animate-pulse'} />;
}
