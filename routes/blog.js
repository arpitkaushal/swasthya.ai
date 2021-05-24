const express = require("express");
const {
    getBlogs,
    createBlog,
    blogsByUser,
    blogById,
    isBloger,
    updateBlog,
    deleteBlog
} = require("../controllers/blog");
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { createBlogValidator } = require("../validator");

const router = express.Router();

router.get("/blogs", getBlogs);
router.post(
    "/blog/new/:userId",
    requireSignin,
    createBlog,
    createBlogValidator
);
router.get("/blogs/by/:userId", requireSignin, blogsByUser);
router.put("/blog/:blogId", requireSignin, isBloger, updateBlog);
router.delete("/blog/:blogId", requireSignin, isBloger, deleteBlog);

// any route containing :userId, our app will first execute userById()
router.param("userId", userById);
// any route containing :blogId, our app will first execute blogById()
router.param("blogId", blogById);

module.exports = router;
