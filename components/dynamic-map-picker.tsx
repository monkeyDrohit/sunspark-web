'use client';

import dynamic from 'next/dynamic';

const DynamicMapPicker = dynamic(
  () => import('./map-picker').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-[300px] w-full rounded-md bg-muted flex items-center justify-center border animate-pulse">Loading Map...</div> }
);

export default DynamicMapPicker;
