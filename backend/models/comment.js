const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

// define various
const commentSchema = new mongoose.Schema({
  commentedAt: {
    type: ObjectId,
    ref: "Blog",
  },
  commentedBy: {
    type: ObjectId,
    ref: "User",
  },
  body: {
    type: String,
    required: true,
    unique: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
});

module.exports = mongoose.model("Comment", commentSchema);
