import { APPHEROCONTENT } from '@/components/app/screens/dashboard/mainpage/app-hero-content'
import { APPHEROContentFallback } from '@/components/app/screens/dashboard/mainpage/app-hero-cotenet-fallback'
import QuickTools from '@/components/app/screens/dashboard/mainpage/quick-tools'
import RecentCreations from '@/components/app/screens/dashboard/mainpage/recenet-creaction'
import TodaysInspiration from '@/components/app/screens/dashboard/mainpage/today-inspiration'
import YourStats from '@/components/app/screens/dashboard/mainpage/your-stats'
import React, { Suspense } from 'react'

const APPPAGE = () => {
  return (
    <main>
      <Suspense fallback={<APPHEROContentFallback/>}>
        <APPHEROCONTENT/>
      </Suspense>
      <QuickTools/>
      <RecentCreations/>
      <YourStats/>
      <TodaysInspiration/>
    
      
    </main>
  )
}

export default APPPAGE
