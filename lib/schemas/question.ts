const mongoose = require("mongoose")

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    default: "",
  },
  image: {
    public_id: { type: String, default: "" },
    url: { type: String, default: "" },
  },
})

const questionSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Educator",
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    public_id: String,
    url: String,
  },
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  marks: {
    positive: {
      type: Number,
      required: true,
    },
    negative: {
      type: Number,
      required: true,
    },
  },
  options: {
    A: {
      type: optionSchema,
    },
    B: {
      type: optionSchema,
    },
    C: {
      type: optionSchema,
    },
    D: {
      type: optionSchema,
    },
  },
  correctOptions: [
    {
      type: String,
    },
  ],
})

module.exports = mongoose.model("Question", questionSchema)
