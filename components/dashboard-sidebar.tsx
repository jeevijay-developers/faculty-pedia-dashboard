"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  BarChart3,
  GraduationCap,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  IndianRupee,
  MessageSquare,
  Loader2,
  Megaphone,
} from "lucide-react";
import Image from "next/image";

const navigation = [
  {
    name: "Profile",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
    submenu: [
      {
        name: "Live Courses",
        href: "/dashboard/courses/live",
      },
      {
        name: "Webinar",
        href: "/dashboard/courses/webinar",
      },
    ],
  },
  {
    name: "Test",
    href: "/dashboard/test",
    icon: TestTube,
    submenu: [
      {
        name: "Question Bank",
        href: "/dashboard/questions",
        icon: FileQuestion,
      },
      {
        name: "Test Bank",
        href: "/dashboard/test",
      },
      {
        name: "Test Series",
        href: "/dashboard/test-series",
      },
    ],
  },
  {
    name: "Content",
    href: "/dashboard/content",
    icon: FileText,
    submenu: [
      {
        name: "Study material",
        href: "/dashboard/content/study-material",
      },
      {
        name: "Videos",
        href: "/dashboard/content/videos",
      },
      {
        name: "Live Classes",
        href: "/dashboard/content/live-classes",
      },
      {
        name: "Post",
        href: "/dashboard/content/post",
      },
    ],
  },
  {
    name: "Revenue",
    href: "/dashboard/revenue",
    icon: IndianRupee,
  },
  {
    name: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: Megaphone,
  },
  {
    name: "Manage Queries",
    href: "/dashboard/manage-queries",
    icon: MessageSquare,
  },
  // {
  //   name: "Pay Per Hour/Webinars",
  //   href: "/dashboard/live-classes",
  //   icon: Video,
  // },
  // {
  //   name: "Students",
  //   href: "/dashboard/students",
  //   icon: Users,
  // },
  // {
  //   name: "Settings",
  //   href: "/dashboard/settings",
  //   icon: Settings,
  // },
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { educator, logout, getFullName } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // Get educator initials
  const getInitials = () => {
    if (!educator) return "E";
    const name = educator.fullName || educator.username || "Educator";
    const [first = "E", second = ""] = name.split(" ").filter(Boolean);
    const initials = `${first.charAt(0)}${second.charAt(0)}`.trim();
    return initials ? initials.toUpperCase() : first.charAt(0).toUpperCase();
  };

  // Get educator image
  const getProfileImage = () => {
    return educator?.profilePicture || educator?.image?.url || null;
  };

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
    setTargetPath(null);
  }, [pathname]);

  // Handle navigation with loading state
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      setIsNavigating(true);
      setTargetPath(href);
      router.push(href);
    }
  };

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: { name: string; href: string }[]) => {
    return submenu.some((subItem) => pathname === subItem.href);
  };

  // Toggle submenu
  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
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
            <Image
              src="/logo-blue.png"
              alt="Faculty Pedia Logo"
              width={32}
              height={32}
            />
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
              // Check if item has submenu
              if (item.submenu) {
                const isOpen = openSubmenu === item.name;
                const hasActiveChild = isSubmenuActive(item.submenu);
                const isParentActive = pathname === item.href;

                return (
                  <div key={item.name}>
                    {/* Parent item with dropdown */}
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.name)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                        isParentActive || hasActiveChild
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
                    </button>

                    {/* Submenu items */}
                    {isOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-sidebar-border pl-3">
                        {item.submenu.map((subItem) => {
                          const isActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={(e) => handleNavigation(subItem.href, e)}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <span>{subItem.name}</span>
                              {isNavigating && targetPath === subItem.href && (
                                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation item without submenu
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  onClick={(e) => handleNavigation(item.href!, e)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                  {isNavigating && targetPath === item.href && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {getProfileImage() ? (
              <Image
                src={getProfileImage()!}
                alt={getFullName()}
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
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
              Are you sure you want to logout? You&apos;ll need to sign in again
              to access your dashboard.
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
