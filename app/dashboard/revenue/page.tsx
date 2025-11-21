"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react"

export default function RevenuePage() {
  // Mock revenue data
  const revenueStats = [
    {
      title: "Total Revenue",
      value: "₹2,45,000",
      change: "+20.1% from last month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Subscriptions",
      value: "245",
      change: "+15% from last month",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Average Revenue",
      value: "₹1,000",
      change: "+5% from last month",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Transactions",
      value: "156",
      change: "+12% from last month",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const recentTransactions = [
    {
      id: 1,
      student: "John Doe",
      course: "Physics Complete Course",
      amount: "₹5,000",
      date: "2025-10-28",
      status: "Completed",
    },
    {
      id: 2,
      student: "Jane Smith",
      course: "Mathematics Advanced",
      amount: "₹4,500",
      date: "2025-10-27",
      status: "Completed",
    },
    {
      id: 3,
      student: "Mike Johnson",
      course: "Chemistry Fundamentals",
      amount: "₹4,000",
      date: "2025-10-26",
      status: "Pending",
    },
    {
      id: 4,
      student: "Sarah Williams",
      course: "Physics Complete Course",
      amount: "₹5,000",
      date: "2025-10-25",
      status: "Completed",
    },
    {
      id: 5,
      student: "David Brown",
      course: "Mathematics Advanced",
      amount: "₹4,500",
      date: "2025-10-24",
      status: "Completed",
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Revenue" />
      <div className="flex-1 p-6 space-y-6">
        {/* Revenue Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {revenueStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{transaction.student}</td>
                      <td className="py-3 px-4 text-sm">{transaction.course}</td>
                      <td className="py-3 px-4 text-sm font-medium">{transaction.amount}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Course Type */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Course Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Live Courses</span>
                </div>
                <span className="text-sm font-medium">₹1,45,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Pay Per Hour</span>
                </div>
                <span className="text-sm font-medium">₹65,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Webinar</span>
                </div>
                <span className="text-sm font-medium">₹35,000</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Physics Complete Course</span>
                <span className="text-sm font-medium">₹85,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mathematics Advanced</span>
                <span className="text-sm font-medium">₹72,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chemistry Fundamentals</span>
                <span className="text-sm font-medium">₹48,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
