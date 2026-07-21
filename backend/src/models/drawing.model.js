const mongoose = require("mongoose");

const drawingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    elements: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Drawing", drawingSchema);