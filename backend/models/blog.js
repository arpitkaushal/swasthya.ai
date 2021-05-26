const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema({
    blogedBy: {
        type: ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    body: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    comments: [
        {
            type: ObjectId,
            ref: "Comment",
        },
    ],
    updated: Date,
});

module.exports = mongoose.model("Blog", blogSchema);
