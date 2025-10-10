"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  TrendingUp,
  BookOpen,
  TestTube,
  Video,
  MoreHorizontal,
  Mail,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock student data
const students = [
  {
    id: "1",
    name: "Arjun Sharma",
    email: "arjun.sharma@email.com",
    phone: "+91 98765 43210",
    avatar: "",
    specialization: "IIT-JEE",
    enrolledCourses: ["Physics Complete", "Mathematics Advanced"],
    testsCompleted: 15,
    liveClassesAttended: 8,
    lastActive: "2 hours ago",
    performance: "Excellent",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+91 87654 32109",
    avatar: "",
    specialization: "NEET",
    enrolledCourses: ["Chemistry Organic", "Biology Complete"],
    testsCompleted: 12,
    liveClassesAttended: 6,
    lastActive: "1 day ago",
    performance: "Good",
    joinedDate: "2024-01-10",
  },
  {
    id: "3",
    name: "Rahul Kumar",
    email: "rahul.kumar@email.com",
    phone: "+91 76543 21098",
    avatar: "",
    specialization: "CBSE",
    enrolledCourses: ["Mathematics Foundation"],
    testsCompleted: 8,
    liveClassesAttended: 4,
    lastActive: "3 days ago",
    performance: "Average",
    joinedDate: "2024-01-05",
  },
];

const studentStats = [
  {
    title: "Total Students",
    value: "2,341",
    description: "Active learners",
    icon: Users,
    trend: "+156 this month",
  },
  {
    title: "Course Enrollments",
    value: "4,892",
    description: "Total enrollments",
    icon: BookOpen,
    trend: "+234 this month",
  },
  {
    title: "Test Attempts",
    value: "12,456",
    description: "Tests completed",
    icon: TestTube,
    trend: "+1,234 this month",
  },
  {
    title: "Live Attendance",
    value: "89%",
    description: "Average attendance",
    icon: Video,
    trend: "+5% this month",
  },
];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "Excellent":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Good":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Average":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Student Management"
        description="Monitor and manage your student community"
      />

      <div className="px-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {studentStats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-primary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Student Directory
            </CardTitle>
            <CardDescription>Search and manage your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, email, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Students</TabsTrigger>
                <TabsTrigger value="iit-jee">IIT-JEE</TabsTrigger>
                <TabsTrigger value="neet">NEET</TabsTrigger>
                <TabsTrigger value="cbse">CBSE</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <Card
                      key={student.id}
                      className="bg-muted/30 border-border"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={student.avatar || "/placeholder.svg"}
                                alt={student.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-card-foreground">
                                {student.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {student.specialization}
                                </Badge>
                                <Badge
                                  className={getPerformanceBadge(
                                    student.performance
                                  )}
                                >
                                  {student.performance}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {student.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {student.phone}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-card-foreground">
                                {student.enrolledCourses.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Courses
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-card-foreground">
                                {student.testsCompleted}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Tests
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-card-foreground">
                                {student.liveClassesAttended}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Pay Per Hour
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  View Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Remove Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Enrolled Courses:{" "}
                              </span>
                              <span className="text-card-foreground">
                                {student.enrolledCourses.join(", ")}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Last active: {student.lastActive}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Other tab contents would filter by specialization */}
              <TabsContent value="iit-jee" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>IIT-JEE students will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="neet" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>NEET students will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="cbse" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>CBSE students will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
