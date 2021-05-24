const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

// define various
const commentSchema = new mongoose.Schema({
  postedAt: {
    type: ObjectId,
    ref: "Blog",
  },
  postedBy: {
    type: ObjectId,
    ref: "User",
  },
  body: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
