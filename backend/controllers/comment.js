const Comment = require("../models/comment");
const User = require("../models/user");
const Blog = require("../models/blog");
const _ = require("lodash");

exports.createComment = async (req, res, next) => {
    const commentExists = await Comment.findOne({ body: req.body.body });
    if (commentExists)
        return res.status(403).json({
            error: `Comment ${req.body.body} is taken. Please choose another one!`,
        });
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    const comment = new Comment(req.body);
    comment.commentedBy = req.profile._id;
    comment.commentedAt = req.blog._id;

    var messages = [];
    messages.push(`${req.body.body}`);
    
    await comment.save((err, result) => {
        if (err) {
            return res.status(400).json({
                message: "Error at createComment",
                error: err,
            });
        }
        messages.push(
            `${req.profile.username} commented successfully on ${req.blog.title}. The comment is ${req.body.body}.`
        );
        res.json({result,});
    });
    
    await Blog.findByIdAndUpdate(
        req.blog._id,
        { $push: { comments: comment } },
        { new: true }
    ).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                text: "Error at createComment: Blog.findByIdAndUpdate",
                error: err,
            });
        }
        messages.push(`Updated comments list at the blog ${req.blog.title}.`);
    });

    await User.findByIdAndUpdate(
        req.profile._id,
        { $push: { comments: comment } },
        { new: true }
    ).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                text: "Error at createComment > User.findByIdAndUpdate",
                error: err,
            });
        } 
        messages.push(`Updated comments list at the user ${req.profile.username}.`);
        // res.json(result);
    });
    // await console.log(messages);
    // console.log(x);
    // res.send.json(x);
};

exports.commentById = (req, res, next, id) => {
    Comment.findById(id)
        .populate("commentedBy", "_id username created")
        .exec((err, comment) => {
            if (err || !comment) {
                return res.status(400).json({
                    error: err,
                    message: "Error in commentById.",
                });
            }
            req.comment = comment;
            next();
        });
};

exports.displayComment = (req, res) => {
    res.send(req.comment);
};

exports.getComment = (req, res) => {
    console.log(req.comment._id);
    const comment = Comment.findbyId(req.comment._id)
        .populate("commentedBy", "_id username created")
        .select("_id body commentedAt commentedBy")
        .then((comment) => {
            res.json(comment);
        })
        .catch((err) =>
            res.json({ message: "Error in getComment", error: err })
        );
};

exports.getComments = (req, res) => {
    const comments = Comment.find()
        .populate("commentedBy", "_id username")
        .populate("commentedAt","_id title")
        .select("_id body")
        .then((comments) => {
            res.json({ comments });
        })
        .catch((err) =>
            res.json({ message: "Error in getComments", error: err })
        );
};

exports.commentsByUser = (req, res) => {
    console.log(req.profile.username);
    const comments = req.profile;
    console.log(comments);
    // const user = User.findbyId(req.profile._id).exec((err, user) => {
    //     if (err || !user) {
    //         return res.status(400).json({
    //             error: "User not found"
    //         });
    //     }
    //     req.profile = user; // adds profile object in req with user info
    // });
    // console.log(user);
    // .populate("commentedBy", "_id username created")
    // .select("_id title body")
    // .then((user) => {
    //     res.json({ user });
    // })
    // .catch((err) => res.json({message:"Error in getComments", error:err}) );
    // console.log(req.profile.username);

    // const theUser = User.findbyId(req.profile._id)
    // .exec( (err,user) => {
    //     if(err||!user){
    //         return res.status(400).json({
    //             message:"Couldn't get user @ commentsByUser",
    //             error: err,
    //         });
    //     }
    //     theUser = user;
    // });
    // console.log(theUser.username);
    // const userComments = user.comments;
    // res.json(userComments);
    // for(comment in userComments)
    Comment.find({ commentedBy: req.profile._id })
        .populate("commentedBy", "_id username created")
        .sort("_created")
        .exec((err, comments) => {
            if (err) {
                return res.status(400).json({
                    message: "Error in commentedByUser",
                    error: err,
                });
            }
            (message = `Comments by ${req.profile.username}`),
                res.json({
                    message: message,
                    comments: comments,
                });
        });
};

exports.isCommenter = (req, res, next) => {
    let isCommenter =
        req.comment && req.auth && req.comment.commentedBy._id == req.auth._id;

    if (!isCommenter) {
        return res.status(403).json({
            error: "User is not authorized",
        });
    }
    next();
};

exports.updateComment = (req, res, next) => {
    let comment = req.comment;
    comment = _.extend(comment, req.body);
    comment.updated = Date.now();
    comment.save((err) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json(comment);
    });
};

exports.deleteComment = (req, res) => {
    let comment = req.comment;
    comment.remove((err, comment) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json({
            message: "Comment deleted successfully",
        });
    });
};
