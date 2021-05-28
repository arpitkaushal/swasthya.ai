const _ = require("lodash");
const User = require("../models/user");
const Comment = require("../models/comment");
const Blog = require("../models/blog");

// https://dmitripavlutin.com/javascript-queue/
class Queue {
    constructor() {
        this.items = {};
        this.headIndex = 0;
        this.tailIndex = 0;
    }

    push(item) {
        this.items[this.tailIndex] = item;
        this.tailIndex++;
    }

    pop() {
        const item = this.items[this.headIndex];
        delete this.items[this.headIndex];
        this.headIndex++;
        return item;
    }

    peek() {
        return this.items[this.headIndex];
    }

    get length() {
        return this.tailIndex - this.headIndex;
    }
}

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        req.profile = user; // adds profile object in req with user info
        next();
    });
};

exports.setLevelNum = (req, res, next, levelNum) => {
    req.level = levelNum;
    next();
};

exports.getLevelFriends = async (req, res) => {
    const k = req.level;
    const q = new Queue();
    var user = req.profile._id;
    q.push(user);
    var visited = []; visited.push(JSON.stringify(user));
    var currLevel = 0;
    while (q.length > 0) {
        console.log(`\nCovered ${currLevel} from root.`);
        console.log(`The queue has ${q.length} elements.`);
        
        var n = q.length;
        for (var j = 0; j < n; j++) {
            var x = "";
            if (currLevel % 2) {            // currently at a Blog Node
                x = await Blog.findById(q.pop(), "comments title").exec();
                if (!(visited.includes(JSON.stringify(x._id)))) {
                    visited.push(JSON.stringify(x._id));
                    // console.log(`Visited ${x.title}`);
                } 
            } 
            else {                          // currently at a User Node
                x = await User.findById(q.pop(), "comments username").exec();
                if (!(visited.includes(JSON.stringify(x._id)))) {
                    visited.push(JSON.stringify(x._id));
                    // console.log(`Visited ${x.username}`);
                }
            }
            // get X's comments
            for (com of x.comments) {
                var y = await Comment.findById(
                    com,
                    "commentedAt commentedBy body"
                ).exec();

                if (currLevel % 2) {        // currently at Blog Node
                    if (!(visited.includes(JSON.stringify(y.commentedBy)))) {
                        q.push(y.commentedBy);
                    } 
                } else {                    // currently at a User Node
                    if (!(visited.includes(JSON.stringify(y.commentedAt)))) {
                        q.push(y.commentedAt);
                    }
                }
            }

        }
        if(q.length>0) currLevel++;
        if (currLevel >= 2 * k ) break;
    }

    var ans = new Set;
    while(q.length){
        const x = await User.findById(q.pop(),'username _id').exec();
        ans.add(JSON.stringify(x));
    }
    const d_ans = [];
    for( id of ans) d_ans.push(JSON.parse(id));
    var message = `Successfully found Level ${k} friends of ${req.profile.username}.`;
    if(!(d_ans.length)) message = `${req.profile.username} doesn't have any Level ${k} friends. Maximum Level for them is ${Math.floor(currLevel/2)} .`;
    res.status(200).json({ message:message, users: d_ans });
};

exports.displayUser = (req, res) => {
    res.send(req.user);
};

exports.hasAuthorization = (req, res, next) => {
    const authorized =
        req.profile && req.auth && req.profile._id === req.auth._id;
    if (!authorized) {
        return res.status(403).json({
            error: "User is not authorized to perform this action",
        });
    }
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        if (err) {
            return res.status(400).json({
                error: err,
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
    user.save((err) => {
        if (err) {
            return res.status(400).json({
                error: "You are not authorized to perform this action",
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
                error: err,
            });
        }
        res.json({ message: "User deleted successfully" });
    });
};
