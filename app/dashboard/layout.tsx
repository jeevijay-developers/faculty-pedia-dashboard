import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { ProfileCompletionBanner } from "@/components/profile-completion-banner"
import { MobileTopBar } from "@/components/mobile/mobile-top-bar"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-[100svh] bg-background md:h-screen">
        {/* Sidebar */}
        <div className="hidden w-64 flex-shrink-0 md:block">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile app bar — self-hiding at md and up */}
          <MobileTopBar />
          <div className="px-4 pt-3 md:px-6 md:pt-4">
            <ProfileCompletionBanner />
          </div>
          <main className="flex-1 overflow-y-auto pb-mobile-nav md:pb-0">{children}</main>
        </div>

        {/* Mobile tab bar — position:fixed, so it is out of the flex flow */}
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  )
}
