const Blog = require("../models/blog");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

exports.blogById = (req, res, next, id) => {
    Blog.findById(id)
        .populate("blogedBy", "_id name")
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: err
                });
            }
            req.blog = blog;
            next();
        });
};

exports.getBlogs = (req, res) => {
    const blogs = Blog.find()
        .populate("blogedBy", "_id name")
        .select("_id title body")
        .then(blogs => {
            res.json({ blogs });
        })
        .catch(err => console.log(err));
};

exports.createBlog = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        let blog = new Blog(fields);

        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        blog.blogedBy = req.profile;

        if (files.photo) {
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }
        blog.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(result);
        });
    });
};

exports.blogsByUser = (req, res) => {
    Blog.find({ blogedBy: req.profile._id })
        .populate("blogedBy", "_id name")
        .sort("_created")
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(blogs);
        });
};

exports.isBloger = (req, res, next) => {
    let isBloger =
        req.blog && req.auth && req.blog.blogedBy._id == req.auth._id;

    if (!isBloger) {
        return res.status(403).json({
            error: "User is not authorized"
        });
    }
    next();
};

exports.updateBlog = (req, res, next) => {
    let blog = req.blog;
    blog = _.extend(blog, req.body);
    blog.updated = Date.now();
    blog.save(err => {
        if (err) {
            return res.status(400).json({
                error: err
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
                error: err
            });
        }
        res.json({
            message: "Blog deleted successfully"
        });
    });
};
