"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Webinar {
  id: number
  title: string
  about: string
  introVideo: string
  date: string
  time: string
  duration: string
  fee: string
  isPublished: boolean
}

export default function WebinarPage() {
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [editFormData, setEditFormData] = useState<Webinar | null>(null)
  const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null)
  
  // Form data for creating new webinar
  const [formData, setFormData] = useState({
    title: "",
    about: "",
    introVideo: "",
    date: "",
    time: "",
    duration: "",
    fee: ""
  })

  const [webinars, setWebinars] = useState<Webinar[]>([
    {
      id: 1,
      title: "Introduction to Physics",
      about: "Learn basic physics concepts",
      introVideo: "https://youtube.com/watch?v=example",
      date: "2025-11-01",
      time: "10:00",
      duration: "2",
      fee: "500",
      isPublished: true
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      about: "Complex mathematical problems",
      introVideo: "https://youtube.com/watch?v=example2",
      date: "2025-11-05",
      time: "14:00",
      duration: "1.5",
      fee: "750",
      isPublished: false
    }
  ])

  const togglePublishStatus = (webinarId: number) => {
    setWebinars(webinars.map(webinar => 
      webinar.id === webinarId 
        ? { ...webinar, isPublished: !webinar.isPublished }
        : webinar
    ))
  }

  const handleViewWebinar = (webinar: Webinar) => {
    setSelectedWebinar(webinar)
    setViewOpen(true)
  }

  const handleEditWebinar = (webinar: Webinar) => {
    setEditFormData(webinar)
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editFormData) return
    
    setWebinars(webinars.map(webinar =>
      webinar.id === editFormData.id ? editFormData : webinar
    ))
    setEditOpen(false)
    setEditFormData(null)
  }

  const handleEditChange = (field: keyof Webinar, value: string | boolean) => {
    if (!editFormData) return
    setEditFormData({ ...editFormData, [field]: value })
  }

  const handleDeleteWebinar = (webinar: Webinar) => {
    setWebinarToDelete(webinar)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!webinarToDelete) return
    
    setWebinars(webinars.filter(webinar => webinar.id !== webinarToDelete.id))
    setDeleteOpen(false)
    setWebinarToDelete(null)
  }

  const cancelDelete = () => {
    setDeleteOpen(false)
    setWebinarToDelete(null)
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmitWebinar = () => {
    // Validate form
    if (!formData.title || !formData.about || !formData.date || !formData.time || !formData.duration || !formData.fee) {
      alert("Please fill all fields")
      return
    }

    // Create new webinar
    const newWebinar: Webinar = {
      id: webinars.length > 0 ? Math.max(...webinars.map(w => w.id)) + 1 : 1,
      title: formData.title,
      about: formData.about,
      introVideo: formData.introVideo,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      fee: formData.fee,
      isPublished: false // Default to unpublished
    }

    // Add to webinars list
    setWebinars([...webinars, newWebinar])

    // Reset form
    setFormData({
      title: "",
      about: "",
      introVideo: "",
      date: "",
      time: "",
      duration: "",
      fee: ""
    })

    // Close dialog
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Webinar"
        description="Manage your webinars and online sessions"
      />

      <div className="px-6">
        {/* Create Webinar Button */}
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Webinar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Webinar</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Title and About - 2 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">
                      Title
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Enter webinar title"
                      className="w-full"
                    />
                  </div>

                  {/* About */}
                  <div className="space-y-2">
                    <Label htmlFor="about" className="text-base font-semibold">
                      About
                    </Label>
                    <Textarea
                      id="about"
                      value={formData.about}
                      onChange={(e) => handleFormChange('about', e.target.value)}
                      placeholder="Enter webinar description"
                      className="w-full min-h-[40px]"
                    />
                  </div>
                </div>

                {/* Intro Video - Full Width */}
                <div className="space-y-2">
                  <Label htmlFor="introVideo" className="text-base font-semibold">
                    Intro video
                  </Label>
                  <Input
                    id="introVideo"
                    type="text"
                    value={formData.introVideo}
                    onChange={(e) => handleFormChange('introVideo', e.target.value)}
                    placeholder="Paste YouTube video link here"
                    className="w-full"
                  />
                </div>

                {/* Date and Time - 2 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-base font-semibold">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-base font-semibold">
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleFormChange('time', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Duration and Fee - 2 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-base font-semibold">
                      Duration (Hours)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleFormChange('duration', e.target.value)}
                      placeholder="e.g., 1, 1.5, 2"
                      className="w-full"
                    />
                  </div>

                  {/* Fee */}
                  <div className="space-y-2">
                    <Label htmlFor="fee" className="text-base font-semibold">
                      Fee
                    </Label>
                    <Input
                      id="fee"
                      type="number"
                      value={formData.fee}
                      onChange={(e) => handleFormChange('fee', e.target.value)}
                      placeholder="Enter fee amount"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmitWebinar}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webinars Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Sr. No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>About</TableHead>
                  <TableHead>Intro Video</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration (Hours)</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="w-[100px]">Publish</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webinars.length > 0 ? (
                  webinars.map((webinar, index) => (
                    <TableRow key={webinar.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{webinar.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{webinar.about}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        <a 
                          href={webinar.introVideo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {webinar.introVideo}
                        </a>
                      </TableCell>
                      <TableCell>{webinar.date}</TableCell>
                      <TableCell>{webinar.time}</TableCell>
                      <TableCell>{webinar.duration}</TableCell>
                      <TableCell>₹{webinar.fee}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={webinar.isPublished}
                          onCheckedChange={() => togglePublishStatus(webinar.id)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewWebinar(webinar)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditWebinar(webinar)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 font-semibold" 
                              onClick={() => handleDeleteWebinar(webinar)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No webinars found. Create your first webinar!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Webinar Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Webinar Details</DialogTitle>
          </DialogHeader>
          {selectedWebinar && (
            <div className="space-y-6 py-4">
              {/* Title and About - 2 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="view-title" className="text-base font-semibold">
                    Title
                  </Label>
                  <Input
                    id="view-title"
                    type="text"
                    value={selectedWebinar.title}
                    className="w-full"
                    readOnly
                    disabled
                  />
                </div>

                {/* About */}
                <div className="space-y-2">
                  <Label htmlFor="view-about" className="text-base font-semibold">
                    About
                  </Label>
                  <Textarea
                    id="view-about"
                    value={selectedWebinar.about}
                    className="w-full min-h-[40px]"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Intro Video - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="view-introVideo" className="text-base font-semibold">
                  Intro video
                </Label>
                <Input
                  id="view-introVideo"
                  type="text"
                  value={selectedWebinar.introVideo}
                  className="w-full"
                  readOnly
                  disabled
                />
              </div>

              {/* Date and Time - 2 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="view-date" className="text-base font-semibold">
                    Date
                  </Label>
                  <Input
                    id="view-date"
                    type="date"
                    value={selectedWebinar.date}
                    className="w-full"
                    readOnly
                    disabled
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="view-time" className="text-base font-semibold">
                    Time
                  </Label>
                  <Input
                    id="view-time"
                    type="time"
                    value={selectedWebinar.time}
                    className="w-full"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Duration and Fee - 2 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="view-duration" className="text-base font-semibold">
                    Duration (Hours)
                  </Label>
                  <Input
                    id="view-duration"
                    type="number"
                    value={selectedWebinar.duration}
                    className="w-full"
                    readOnly
                    disabled
                  />
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <Label htmlFor="view-fee" className="text-base font-semibold">
                    Fee
                  </Label>
                  <Input
                    id="view-fee"
                    type="number"
                    value={selectedWebinar.fee}
                    className="w-full"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Status
                </Label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedWebinar.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedWebinar.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Webinar Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Webinar</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-6 py-4">
              {/* Title and About - 2 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-base font-semibold">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    placeholder="Enter webinar title"
                    className="w-full"
                  />
                </div>

                {/* About */}
                <div className="space-y-2">
                  <Label htmlFor="edit-about" className="text-base font-semibold">
                    About
                  </Label>
                  <Textarea
                    id="edit-about"
                    value={editFormData.about}
                    onChange={(e) => handleEditChange('about', e.target.value)}
                    placeholder="Enter webinar description"
                    className="w-full min-h-[40px]"
                  />
                </div>
              </div>

              {/* Intro Video - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="edit-introVideo" className="text-base font-semibold">
                  Intro video
                </Label>
                <Input
                  id="edit-introVideo"
                  type="text"
                  value={editFormData.introVideo}
                  onChange={(e) => handleEditChange('introVideo', e.target.value)}
                  placeholder="Paste YouTube video link here"
                  className="w-full"
                />
              </div>

              {/* Date and Time - 2 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-base font-semibold">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="edit-time" className="text-base font-semibold">
                    Time
                  </Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Duration and Fee - 2 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="edit-duration" className="text-base font-semibold">
                    Duration (Hours)
                  </Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editFormData.duration}
                    onChange={(e) => handleEditChange('duration', e.target.value)}
                    placeholder="e.g., 1, 1.5, 2"
                    className="w-full"
                  />
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <Label htmlFor="edit-fee" className="text-base font-semibold">
                    Fee
                  </Label>
                  <Input
                    id="edit-fee"
                    type="number"
                    value={editFormData.fee}
                    onChange={(e) => handleEditChange('fee', e.target.value)}
                    placeholder="Enter fee amount"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Save and Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the webinar
              {webinarToDelete && ` "${webinarToDelete.title}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
