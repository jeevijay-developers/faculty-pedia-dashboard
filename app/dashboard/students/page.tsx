"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"

interface EnrolledStudent {
  id: number
  name: string
  dateOfEnrollment: string
  courseName: string
  courseType: "one to one" | "one to all"
  amountPaid: number
  contactNumber: string
}

export default function StudentsPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Mock data
  const totalFollowers = 1250

  const enrolledStudents: EnrolledStudent[] = [
    {
      id: 1,
      name: "Arjun Sharma",
      dateOfEnrollment: "2025-09-15",
      courseName: "Physics Complete Course",
      courseType: "one to all",
      amountPaid: 5000,
      contactNumber: "+91 98765 43210",
    },
    {
      id: 2,
      name: "Priya Patel",
      dateOfEnrollment: "2025-09-20",
      courseName: "Mathematics Advanced",
      courseType: "one to one",
      amountPaid: 8000,
      contactNumber: "+91 98765 43211",
    },
    {
      id: 3,
      name: "Rahul Verma",
      dateOfEnrollment: "2025-10-01",
      courseName: "Chemistry Fundamentals",
      courseType: "one to all",
      amountPaid: 4000,
      contactNumber: "+91 98765 43212",
    },
    {
      id: 4,
      name: "Ananya Singh",
      dateOfEnrollment: "2025-10-05",
      courseName: "Physics Complete Course",
      courseType: "one to all",
      amountPaid: 5000,
      contactNumber: "+91 98765 43213",
    },
    {
      id: 5,
      name: "Vikram Reddy",
      dateOfEnrollment: "2025-10-10",
      courseName: "Mathematics Advanced",
      courseType: "one to one",
      amountPaid: 8000,
      contactNumber: "+91 98765 43214",
    },
    {
      id: 6,
      name: "Sneha Gupta",
      dateOfEnrollment: "2025-10-15",
      courseName: "Chemistry Fundamentals",
      courseType: "one to all",
      amountPaid: 4000,
      contactNumber: "+91 98765 43215",
    },
  ]

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Filter students based on debounced search query
  const filteredStudents = enrolledStudents.filter(student =>
    student.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    student.courseName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    student.contactNumber.includes(debouncedSearchQuery)
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Students" />
      <div className="flex-1 p-6 space-y-6">
        {/* Total Followers Section */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Total Followers</h2>
          </div>
          <p className="text-5xl  font-bold text-white">{totalFollowers.toLocaleString()}</p>
        </div>

        {/* Enrolled Students Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Enrolled Students</h3>
            
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                placeholder="Search by name, course, or contact number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of Enrollment</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Course Type</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Contact Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No enrolled students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          {new Date(student.dateOfEnrollment).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{student.courseName}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.courseType === "one to one"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {student.courseType}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{student.amountPaid.toLocaleString()}
                        </TableCell>
                        <TableCell>{student.contactNumber}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
