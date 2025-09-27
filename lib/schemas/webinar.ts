const mongoose = require("mongoose")

// Utility function to generate slug
function generateSlug(title, id) {
  const titlePart = title.toLowerCase().trim().split(/\s+/).slice(0, 6).join("-")
  const idPart = id ? id.toString().slice(-6) : Math.random().toString(36).substring(2, 8)
  return `${titlePart}-${idPart}`
}

const webinarSchema = new mongoose.Schema(
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
    webinarType: {
      type: String,
      required: true,
      enum: ["OTO", "OTA"],
      default: "OTA",
    },
    time: {
      type: String,
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
    date: {
      type: Date,
      required: true,
    },
    seatLimit: {
      type: Number,
      required: true,
      default: 1,
    },
    duration: {
      // in minutes
      type: Number,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
      default: 0,
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
    enrolledStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      },
    ],
    webinarLink: {
      type: String,
    },
    assetsLinks: [
      {
        name: { type: String, enum: ["PPT", "VIDEO", "PDF", "DOC"] },
        link: { type: String },
      },
    ],
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
webinarSchema.pre("save", function (next) {
  if (!this.slug && this.title && this._id) {
    this.slug = generateSlug(this.title, this._id)
  }
  next()
})

module.exports = mongoose.model("Webinar", webinarSchema)
