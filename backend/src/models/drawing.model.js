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

    elements: [
      {
        id: String,
        type: String,

        x: Number,
        y: Number,

        width: Number,
        height: Number,

        strokeColor: String,
        backgroundColor: String,

        text: String,

        points: [
          {
            x: Number,
            y: Number,
          },
        ],
      },
    ],

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