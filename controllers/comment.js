const Comment = require("../models/comment");
const User = require("../models/user");
const _ = require("lodash");

exports.createComment = (req, res, next) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    const comment = new Comment(req.body);
    comment.commentedBy = req.profile._id;
    comment.commentedAt = req.blog._id;
    comment
        .save((err, result) => {
            if (err) {
                return res.status(400).json({
                    message: "Error at createComment",
                    error: err,
                });
            }
            res.json({
                message: `${req.profile.username} commented successfully on ${req.blog.title}. The comment ${req.body.body}`,
                result,
            });
        })
        .then(() => {
            Post.findByIdAndUpdate(
                req.blog._id,
                { $push: { comments: comment } },
                { new: true }
            ).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        text: "Error at createComment: Post.findByIdAndUpdate",
                        error: err,
                    });
                } else {
                    res.json(result);
                }
            });
        })
        .then(() => {
            User.findByIdAndUpdate(
                req.profile._id,
                { $push: { comments: comment } },
                { new: true }
            ).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        text: "Error at createComment > User.findByIdAndUpdate",
                        error: err,
                    });
                } else {
                    res.json(result);
                }
            });
        });
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
        .populate("commentedBy", "_id username created")
        .select("_id title body")
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
