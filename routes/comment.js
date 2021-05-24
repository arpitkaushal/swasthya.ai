const express = require("express");
const {
    getComments,
    createComment,
    commentsByUser,
    commentById,
    isCommenter,
    updateComment,
    deleteComment,
    getComment,
    displayComment
} = require("../controllers/comment");
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { blogById } = require("../controllers/blog");
const { createCommentValidator } = require("../validator");

const router = express.Router();

router.get("/comments", getComments);
router.post(
    "/comment/:blogId/:userId/",
    // requireSignin,
    createCommentValidator,
    createComment,
);
router.get("/comments/by/:userId", commentsByUser);
router.get("/comment/:commentId", commentById, displayComment);
router.put("/comment/:commentId", requireSignin, isCommenter, updateComment);
router.delete("/comment/:commentId", requireSignin, isCommenter, deleteComment);

// any route containing :commentId, our app will first execute commentById()
router.param("commentId", commentById);
// any route containing :userId, our app will first execute userById()
router.param("userId", userById);
// any route containing :blogId, our app will first execute blogById()
router.param("blogId", blogById);

module.exports = router;
