const mongoose = require("mongoose")

function generateSlug(title, id) {
  const titlePart = title.toLowerCase().trim().split(/\s+/).slice(0, 6).join("-")
  const idPart = id ? id.toString().slice(-6) : Math.random().toString(36).substring(2, 8)
  return `${titlePart}-${idPart}`
}

const testSeriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      short: {
        type: String,
        required: true,
      },
      long: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    validity: {
      type: Number,
      required: true,
      min: 1,
      default: 30, // Default validity in days
    },
    noOfTests: {
      type: Number,
      required: true,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    image: {
      public_id: String,
      url: String,
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
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
      enum: ["IIT-JEE", "NEET", "CBSE"],
      trim: true,
    },
    enrolledStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      },
    ],
    liveTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveTest",
      },
    ],
    isCourseSpecific: {
      type: Boolean,
      default: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save hook for slug generation
testSeriesSchema.pre("save", function (next) {
  if (!this.slug && this.title && this._id) {
    this.slug = generateSlug(this.title, this._id)
  }
  next()
})

module.exports = mongoose.model("LiveTestSeries", testSeriesSchema)
