"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  FileQuestion,
  TestTube,
  Video,
  BarChart3,
  Settings,
  GraduationCap,
  Users,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    name: "Question Bank",
    href: "/dashboard/questions",
    icon: FileQuestion,
  },
  {
    name: "Test Bank",
    href: "/dashboard/create-test",
    icon: FileQuestion,
  },
  {
    name: "Test Series",
    href: "/dashboard/test-series",
    icon: TestTube,
  },
  {
    name: "Pay Per Hour/Webinars",
    href: "/dashboard/live-classes",
    icon: Video,
  },
  {
    name: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { educator, logout, getFullName } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Get educator initials
  const getInitials = () => {
    if (!educator) return "E";
    const firstName = educator.firstName || "";
    const lastName = educator.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "E";
  };

  // Get educator image
  const getProfileImage = () => {
    return educator?.image?.url || null;
  };

  return (
    <>
      <div
        className={cn(
          "flex h-full flex-col bg-sidebar border-r border-sidebar-border",
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Faculty Pedia
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                An educational platform
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {getProfileImage() ? (
              <img
                src={getProfileImage()!}
                alt={getFullName()}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {getInitials()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {getFullName()}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {educator?.email || "educator@example.com"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowLogoutDialog(true)}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to
              access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
