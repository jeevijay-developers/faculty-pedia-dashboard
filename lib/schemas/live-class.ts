const mongoose = require("mongoose")
const { parseDate } = require("../helpers/utilityFunctions")

const liveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LiveCourse",
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    // in minutes
    type: Number,
    required: true,
  },
  liveClassLink: {
    type: String,
  },
  enrolledStudents: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    },
  ],
  assetsLinks: [
    {
      name: { type: String, enum: ["PPT", "VIDEO", "PDF"] },
      link: { type: String },
    },
  ],
})

liveClassSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  topic: "text",
})
liveClassSchema.index({ courseId: 1, date: 1 })
liveClassSchema.pre("save", function (next) {
  const parsedDate = parseDate(this.date)

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return next(new Error("Invalid class date"))
  }

  if (parsedDate <= new Date()) {
    return next(new Error("Class date must be in the future"))
  }

  this.date = parsedDate
  next()
})

module.exports = mongoose.model("LiveClass", liveClassSchema)
