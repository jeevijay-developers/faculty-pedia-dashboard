const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    specialization: {
      type: String,
      required: true,
      enum: ["IIT-JEE", "NEET", "CBSE"],
      trim: true,
    },
    courseClass: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      default: "10",
    },
    subject: {
      type: String,
      trim: true,
      lowercase: true,
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Educator",
      required: true,
    },
    purchases: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      },
    ],
    image: {
      public_id: String,
      url: String,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      shortDesc: {
        type: String,
        required: true,
      },
      longDesc: {
        type: String,
        required: true,
      },
    },
    courseType: {
      type: String,
      enum: ["one-to-all", "one-to-one"],
      default: "one-to-all",
      set: (value: string) => {
        if (value === "OTO") return "one-to-one";
        if (value === "OTA") return "one-to-all";
        return value;
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    seatLimit: {
      type: Number,
      required: true,
      default: 1,
    },
    classDuration: {
      // in hours
      type: Number,
      required: true,
      default: 1,
    },
    fees: {
      type: Number,
      required: true,
      default: 0,
    },
    validity: {
      type: Number,
      required: true,
      min: 1,
      default: 30, // Default validity in days
    },
    videos: {
      intro: {
        type: String,
      },
      descriptionVideo: {
        type: String,
      },
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveClass",
      },
    ],
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveTest",
      },
    ],
    enrolledStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
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
  }
);

module.exports = mongoose.model("Course", courseSchema);
