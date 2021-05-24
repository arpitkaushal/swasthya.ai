const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    blogedBy: {
        type: ObjectId,
        ref: "User",
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
});

module.exports = mongoose.model("Blog", blogSchema);
