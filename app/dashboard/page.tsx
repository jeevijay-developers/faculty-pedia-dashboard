"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileQuestion,
  TestTube,
  Video,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { educator, getFullName } = useAuth();
  const [loading, setLoading] = useState(false);
  console.log("Educator:", educator);
  // Calculate stats from educator data
  const coursesCount = educator?.courses?.length || 0;
  const questionsCount = educator?.questions?.length || 0;
  const testSeriesCount = educator?.testSeries?.length || 0;
  const studentsCount = educator?.followers?.length || 0;
  const webinarsCount = educator?.webinars?.length || 0;
  const liveTestsCount = educator?.liveTests?.length || 0;

  const statsData = [
    {
      title: "Total Courses",
      value: coursesCount.toString(),
      description: `${coursesCount} courses created`,
      icon: BookOpen,
      trend: `Subject: ${educator?.subject || "N/A"}`,
      href: "/dashboard/courses",
    },
    {
      title: "Question Bank",
      value: questionsCount.toString(),
      description: "Questions created",
      icon: FileQuestion,
      trend: `Specialization: ${educator?.specialization || "N/A"}`,
      href: "/dashboard/questions",
    },

    {
      title: "Test Series",
      value: testSeriesCount.toString(),
      description: "Test series created",
      icon: TestTube,
      trend: `${liveTestsCount} live tests`,
      href: "/dashboard/test-series",
    },
    {
      title: "Followers",
      value: studentsCount.toString(),
      description: "Total followers",
      icon: Users,
      trend: `Rating: ${educator?.rating || 0}/5`,
      href: "/dashboard/students",
    },
  ];

  const liveStatsData = [
    {
      title: "Webinars",
      value: webinarsCount.toString(),
      description: "Total webinars",
      icon: Calendar,
      status: `${educator?.yearsExperience || 0} years exp`,
      href: "/dashboard/live-classes",
    },
    {
      title: "Experience",
      value: `${educator?.yearsExperience || 0}yr`,
      description: "Teaching experience",
      icon: Clock,
      status: educator?.status || "active",
      href: "/dashboard/settings",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`Welcome back, ${getFullName()}!`}
        description={`${educator?.specialization || "Teaching"} • ${
          educator?.subject || "Multiple Subjects"
        }`}
      />

      <div className="px-6 space-y-6">
        {/* Educator Profile Summary */}
        <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group h-full">
          <CardHeader>
            <div className="flex items-center gap-4">
              {educator?.image?.url ? (
                <img
                  src={educator.image.url}
                  alt={getFullName()}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {educator?.firstName?.charAt(0)}
                  {educator?.lastName?.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl text-card-foreground">
                  {getFullName()}
                </CardTitle>
                <CardDescription className="text-base">
                  {educator?.specialization} • {educator?.subject}
                  {educator?.bio &&
                    ` • ${educator.bio.substring(0, 100)}${
                      educator.bio.length > 100 ? "..." : ""
                    }`}
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    {educator?.status || "active"}
                  </Badge>
                  <Badge variant="outline">⭐ {educator?.rating || 0}/5</Badge>
                  {educator?.payPerHourFees && educator.payPerHourFees > 0 && (
                    <Badge variant="outline">
                      ₹{educator.payPerHourFees}/hr
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
            </Link>
          ))}
        </div>

        {/* Live Sessions Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {liveStatsData.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {stat.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Qualifications & Experience */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Qualifications */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Qualifications
              </CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent>
              {educator?.qualification && educator.qualification.length > 0 ? (
                <div className="space-y-3">
                  {educator.qualification.slice(0, 3).map((qual, index) => (
                    <div key={index} className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium text-card-foreground">
                        {qual.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {qual.institute}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(qual.startDate).getFullYear()}
                        {qual.endDate &&
                          ` - ${new Date(qual.endDate).getFullYear()}`}
                      </p>
                    </div>
                  ))}
                  {educator.qualification.length > 3 && (
                    <Link
                      href="/dashboard/settings"
                      className="text-xs text-primary hover:underline"
                    >
                      View all {educator.qualification.length} qualifications →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No qualifications added yet</p>
                  <Link
                    href="/dashboard/settings"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Add qualifications →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Work Experience
              </CardTitle>
              <CardDescription>Your professional history</CardDescription>
            </CardHeader>
            <CardContent>
              {educator?.workExperience &&
              educator.workExperience.length > 0 ? (
                <div className="space-y-3">
                  {educator.workExperience.slice(0, 3).map((exp, index) => (
                    <div key={index} className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium text-card-foreground">
                        {exp.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exp.company}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exp.startDate).getFullYear()}
                        {exp.endDate &&
                          ` - ${new Date(exp.endDate).getFullYear()}`}
                      </p>
                    </div>
                  ))}
                  {educator.workExperience.length > 3 && (
                    <Link
                      href="/dashboard/settings"
                      className="text-xs text-primary hover:underline"
                    >
                      View all {educator.workExperience.length} experiences →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No work experience added yet</p>
                  <Link
                    href="/dashboard/settings"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Add experience →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/courses">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      Create Course
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Start building
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/questions">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileQuestion className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      Add Questions
                    </p>
                    <p className="text-xs text-muted-foreground">Expand bank</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/test-series">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <TestTube className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      Create Test
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Build series
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/live-classes">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      Schedule Live
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Plan session
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        {educator?.socials &&
          Object.values(educator.socials).some((link) => link) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Social Media
                </CardTitle>
                <CardDescription>
                  Your connected social profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {educator.socials.instagram && (
                    <a
                      href={educator.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-card-foreground">
                        Instagram
                      </span>
                    </a>
                  )}
                  {educator.socials.facebook && (
                    <a
                      href={educator.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-card-foreground">
                        Facebook
                      </span>
                    </a>
                  )}
                  {educator.socials.twitter && (
                    <a
                      href={educator.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-card-foreground">
                        Twitter
                      </span>
                    </a>
                  )}
                  {educator.socials.linkedin && (
                    <a
                      href={educator.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-card-foreground">
                        LinkedIn
                      </span>
                    </a>
                  )}
                  {educator.socials.youtube && (
                    <a
                      href={educator.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-card-foreground">
                        YouTube
                      </span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
