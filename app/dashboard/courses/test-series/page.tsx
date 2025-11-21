"use client"

import { DashboardHeader } from "@/components/dashboard-header"

export default function TestSeriesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Test Series"
        description="Manage your test series and assessments"
      />

      <div className="px-6">
        {/* Content will go here */}
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Test Series</h2>
          <p className="mt-2 text-gray-500">Your test series content will appear here</p>
        </div>
      </div>
    </div>
  )
}
