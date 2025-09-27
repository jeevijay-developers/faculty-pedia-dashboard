const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const educatorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      public_id: String,
      url: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    payPerHourFees: {
      type: Number,
      default: 0,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    workExperience: [
      {
        title: {
          type: String,
          uppercase: true,
        },
        company: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    introVideoLink: String,
    qualification: [
      {
        title: {
          type: String,
          uppercase: true,
        },
        institute: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    socials: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    rating: {
      type: Number,
      default: 0,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      enum: ["IIT-JEE", "NEET", "CBSE"],
    },
    role: {
      type: String,
      default: "educator",
    },
    subject: {
      type: String,
      trim: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveCourse",
      },
    ],
    webinars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Webinar",
      },
    ],
    testSeries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSeries",
      },
    ],
    liveTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveTest",
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    yearsExperience: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

educatorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})
educatorSchema.pre("validate", async function (next) {
  if (!this.slug) {
    const baseSlug = `${this.firstName}-${this.lastName}`.toLowerCase().replace(/\s+/g, "-")
    // If _id exists (on update), use it; otherwise, generate a random string
    const uniquePart = this._id ? this._id.toString().slice(-6) : Math.random().toString(36).substring(2, 8)
    this.slug = `${baseSlug}-${uniquePart}`
  }
  next()
})

module.exports = mongoose.model("Educator", educatorSchema)
