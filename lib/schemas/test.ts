const mongoose = require("mongoose")

// Utility function to generate slug
function generateSlug(title, id) {
  const titlePart = title.toLowerCase().trim().split(/\s+/).slice(0, 6).join("-")
  const idPart = id ? id.toString().slice(-6) : Math.random().toString(36).substring(2, 8)
  return `${titlePart}-${idPart}`
}

const liveTestSchema = new mongoose.Schema(
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
    image: {
      public_id: String,
      url: String,
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
    startDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    overallMarks: {
      positive: {
        type: Number,
      },
      negative: {
        type: Number,
      },
    },
    markingType: {
      type: String,
      required: true,
      enum: ["OAM", "PQM"], // overall marks, per question marks
      default: "PQM",
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    testSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTestSeries",
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
      required: true,
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
liveTestSchema.pre("save", function (next) {
  if (!this.slug && this.title && this._id) {
    this.slug = generateSlug(this.title, this._id)
  }
  next()
})

module.exports = mongoose.model("LiveTest", liveTestSchema)
