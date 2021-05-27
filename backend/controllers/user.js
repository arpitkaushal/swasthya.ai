const _ = require("lodash");
const User = require("../models/user");

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found"
            });
        }
        req.profile = user; // adds profile object in req with user info
        next();
    });
};

exports.setLevelNum = (req,res,next,levelNum) => {
    req.level = levelNum;
    next();
}

exports.getLevelFriends = (req,res) => {
    /// write bfs here
    const k = req.level;
    console.log("Hey, you're inside the function that we'll complete soon and taste glory!");
    console.log(`You're checking level ${k} friends for the user ${req.profile.username} who has ID ${req.profile._id}.`)
    res.status(200).json({message: "You're awesome!"})

}

exports.displayUser = (req, res) => {
    res.send(req.user);
};

exports.hasAuthorization = (req, res, next) => {
    const authorized =
        req.profile && req.auth && req.profile._id === req.auth._id;
    if (!authorized) {
        return res.status(403).json({
            error: "User is not authorized to perform this action"
        });
    }
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({ users });
    }).select("username comments created");
};

exports.getUser = (req, res, next) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
    next();
};

exports.updateUser = (req, res, next) => {
    let user = req.profile;
    user = _.extend(user, req.body); // extend - mutate the source object
    user.updated = Date.now();
    user.save(err => {
        if (err) {
            return res.status(400).json({
                error: "You are not authorized to perform this action"
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json({ user });
    });
};

exports.deleteUser = (req, res, next) => {
    let user = req.profile;
    user.remove((err, user) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({ message: "User deleted successfully" });
    });
};
