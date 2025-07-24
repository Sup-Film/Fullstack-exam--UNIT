// Providers สำหรับ React Query
// เป็นตัวกลางสำหรับจัดการ state และ lifecycle ของการดึงข้อมูล (data fetching) ในแอป
// ทำให้สามารถใช้ React Query ได้ทั่วทั้งแอปพลิเคชัน

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
