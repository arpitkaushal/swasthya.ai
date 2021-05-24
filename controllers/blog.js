const Blog = require("../models/blog");
const _ = require("lodash");

exports.createBlog = async (req, res, next) => {
    const blogExists = await Blog.findOne({ title: req.body.title });
    if (blogExists)
        return res.status(403).json({
            error: `Title ${req.body.title}  is taken. Please choose another one!`,
        });
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    const blog = await new Blog(req.body);
    blog.blogedBy = req.profile;
    await blog.save((err, result) => {
        if (err) {
            return res.status(400).json({
                message: "Error at createBlog",
                error: err,
            });
        }
        res.json({
            message: `${req.profile.username} created blog successfully`,
            result,
        });
    });
};

exports.blogById = (req, res, next, id) => {
    Blog.findById(id)
        .populate("blogedBy", "_id username created")
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: err,
                    message: "Error in blogById.",
                });
            }
            req.blog = blog;
            next();
        });
};

exports.displayBlog = (req, res) => {
    res.send(req.blog);
};

exports.getBlog = (req, res) => {
    const blog = Blog.findbyId(req.blog._id)
        .select("_id title body created")
        .populate("comments", "_id body commentedBy")
        .populate("blogedBy", "_id username created")
        .then((blogs) => {
            res.json({ blogs });
        })
        .catch((err) => res.json({ message: "Error in getBlogs", error: err }));
};

exports.getBlogs = (req, res) => {
    const blogs = Blog.find()
        .select("_id title body created")
        .populate("comments", "_id body commentedBy")
        .populate("blogedBy", "_id username created")
        .then((blogs) => {
            res.json({ blogs });
        })
        .catch((err) => res.json({ message: "Error in getBlogs", error: err }));
};

exports.blogsByUser = (req, res) => {
    Blog.find({ blogedBy: req.profile._id })
        .populate("blogedBy", "_id username created")
        .sort("_created")
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    message: "Error in blogedByUser",
                    error: err,
                });
            }
            (message = `Blogs by ${req.profile.username}`),
                res.json({
                    message: message,
                    blogs: blogs,
                });
        });
};

exports.isBloger = (req, res, next) => {
    let isBloger =
        req.blog && req.auth && req.blog.blogedBy._id == req.auth._id;

    if (!isBloger) {
        return res.status(403).json({
            error: "User is not authorized",
        });
    }
    next();
};

exports.updateBlog = (req, res, next) => {
    let blog = req.blog;
    blog = _.extend(blog, req.body);
    blog.updated = Date.now();
    blog.save((err) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json(blog);
    });
};

exports.deleteBlog = (req, res) => {
    let blog = req.blog;
    blog.remove((err, blog) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json({
            message: "Blog deleted successfully",
        });
    });
};
