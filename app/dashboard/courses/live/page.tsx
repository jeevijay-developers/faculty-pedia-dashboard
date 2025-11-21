"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function LiveCoursesPage() {
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [showExamDropdown, setShowExamDropdown] = useState(false)
  const [showClassDropdown, setShowClassDropdown] = useState(false)
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false)

  const examDropdownRef = useRef<HTMLDivElement>(null)
  const classDropdownRef = useRef<HTMLDivElement>(null)
  const featureDropdownRef = useRef<HTMLDivElement>(null)

  const exams = ["JEE", "NEET", "CBSE"]
  const classes = ["6", "7", "8", "9", "10", "11", "12"]
  const features = [
    "Live Class",
    "Study material (PDF)",
    "Online Tests",
    "Recording of live classes",
    "Doubt support",
    "Printed study material"
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (examDropdownRef.current && !examDropdownRef.current.contains(event.target as Node)) {
        setShowExamDropdown(false)
      }
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false)
      }
      if (featureDropdownRef.current && !featureDropdownRef.current.contains(event.target as Node)) {
        setShowFeatureDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleExam = (exam: string) => {
    setSelectedExams(prev =>
      prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]
    )
  }

  const toggleClass = (classValue: string) => {
    setSelectedClasses(prev =>
      prev.includes(classValue) ? prev.filter(c => c !== classValue) : [...prev, classValue]
    )
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  const removeExam = (exam: string) => {
    setSelectedExams(prev => prev.filter(e => e !== exam))
  }

  const removeClass = (classValue: string) => {
    setSelectedClasses(prev => prev.filter(c => c !== classValue))
  }

  const removeFeature = (feature: string) => {
    setSelectedFeatures(prev => prev.filter(f => f !== feature))
  }
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Live Courses"
        description="Manage your live courses and sessions"
      />

      <div className="px-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Live Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Title and Duration - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Title */}
              <div className="space-y-2">
                <Label htmlFor="courseTitle" className="text-base font-semibold">
                  Title
                </Label>
                <Input
                  id="courseTitle"
                  placeholder="Enter course title"
                  className="w-full"
                />
              </div>

              {/* Duration of Course */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-base font-semibold">
                  Duration of Course
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 months, 6 weeks"
                  className="w-full"
                />
              </div>
            </div>

            {/* Starting Date and Ending Date - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Starting Date */}
              <div className="space-y-2">
                <Label htmlFor="startingDate" className="text-base font-semibold">
                  Starting Date
                </Label>
                <Input
                  id="startingDate"
                  type="date"
                  className="w-full"
                />
              </div>

              {/* Courses Ending Date */}
              <div className="space-y-2">
                <Label htmlFor="endingDate" className="text-base font-semibold">
                  Courses Ending Date
                </Label>
                <Input
                  id="endingDate"
                  type="date"
                  className="w-full"
                />
              </div>
            </div>

            {/* For Exam, For Class, and Subject - 3 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* For Exam - Multi-Select Dropdown */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">For Exam</Label>
                <div className="relative" ref={examDropdownRef}>
                  <div
                    className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
                    onClick={() => setShowExamDropdown(!showExamDropdown)}
                  >
                    {selectedExams.length > 0 ? (
                      selectedExams.map((exam) => (
                        <Badge
                          key={exam}
                          variant="secondary"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeExam(exam)
                          }}
                        >
                          {exam}
                          <X className="h-3 w-3 cursor-pointer" />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Select exams</span>
                    )}
                  </div>
                  {showExamDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                      {exams.map((exam) => (
                        <div
                          key={exam}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent"
                          onClick={() => toggleExam(exam)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedExams.includes(exam)}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">{exam}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* For Class - Multi-Select Dropdown */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">For Class</Label>
                <div className="relative" ref={classDropdownRef}>
                  <div
                    className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                  >
                    {selectedClasses.length > 0 ? (
                      selectedClasses.map((classValue) => (
                        <Badge
                          key={classValue}
                          variant="secondary"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeClass(classValue)
                          }}
                        >
                          Class {classValue}
                          <X className="h-3 w-3 cursor-pointer" />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Select classes</span>
                    )}
                  </div>
                  {showClassDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
                      {classes.map((classValue) => (
                        <div
                          key={classValue}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent"
                          onClick={() => toggleClass(classValue)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(classValue)}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">Class {classValue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject - Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-semibold">
                  Subject
                </Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* About Course - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="aboutCourse" className="text-base font-semibold">
                About Course
              </Label>
              <Textarea
                id="aboutCourse"
                placeholder="Enter course description..."
                className="w-full min-h-[100px]"
              />
            </div>

            {/* Course Feature - Full Width */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Course Feature</Label>
              <div className="relative" ref={featureDropdownRef}>
                <div
                  className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 items-center"
                  onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
                >
                  {selectedFeatures.length > 0 ? (
                    selectedFeatures.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFeature(feature)
                        }}
                      >
                        {feature}
                        <X className="h-3 w-3 cursor-pointer" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Select course features</span>
                  )}
                </div>
                {showFeatureDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
                    {features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent"
                        onClick={() => toggleFeature(feature)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feature)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Course Fee and Course Validity - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Fee */}
              <div className="space-y-2">
                <Label htmlFor="courseFee" className="text-base font-semibold">
                  Course Fee
                </Label>
                <Input
                  id="courseFee"
                  type="number"
                  placeholder="Enter course fee"
                  className="w-full"
                />
              </div>

              {/* Course Validity */}
              <div className="space-y-2">
                <Label htmlFor="courseValidity" className="text-base font-semibold">
                  Course Validity (Months)
                </Label>
                <Input
                  id="courseValidity"
                  type="number"
                  placeholder="Enter validity in months"
                  className="w-full"
                />
              </div>
            </div>

            {/* Video Link and Video Title - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Course Intro Video */}
              <div className="space-y-2">
                <Label htmlFor="introVideo" className="text-base font-semibold">
                  Upload Course Intro Video
                </Label>
                <Input
                  id="introVideo"
                  type="text"
                  placeholder="Paste YouTube video link here"
                  className="w-full"
                />
              </div>

              {/* Video Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Video Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter video title"
                  className="w-full"
                />
              </div>
            </div>

            {/* Classes Per Week and Test Frequency - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Live Classes Per Week */}
              <div className="space-y-2">
                <Label htmlFor="classesPerWeek" className="text-base font-semibold">
                  Number of Live Classes Per Week
                </Label>
                <Input
                  id="classesPerWeek"
                  type="number"
                  placeholder="Enter classes per week"
                  className="w-full"
                />
              </div>

              {/* Test Frequency Per Week */}
              <div className="space-y-2">
                <Label htmlFor="testFrequency" className="text-base font-semibold">
                  Test Frequency Per Week
                </Label>
                <Input
                  id="testFrequency"
                  type="number"
                  placeholder="Enter test frequency per week"
                  className="w-full"
                />
              </div>
            </div>

            {/* Class Duration and Class Timing - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Each Class Duration */}
              <div className="space-y-2">
                <Label htmlFor="classDuration" className="text-base font-semibold">
                  Each Class Duration (Hours)
                </Label>
                <Input
                  id="classDuration"
                  type="number"
                  placeholder="e.g., 1"
                  className="w-full"
                />
              </div>

              {/* Class Timing */}
              <div className="space-y-2">
                <Label htmlFor="classTiming" className="text-base font-semibold">
                  Class Timing
                </Label>
                <Input
                  id="classTiming"
                  type="time"
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
              >
                Create Course
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
