const mongoose = require("mongoose");

const QUEST_STATUSES = ["open", "in_progress", "completed", "archived"];

const questSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quest title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Quest description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Quest category is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: QUEST_STATUSES,
      default: "open",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Quest = mongoose.model("Quest", questSchema);

module.exports = Quest;
module.exports.QUEST_STATUSES = QUEST_STATUSES;