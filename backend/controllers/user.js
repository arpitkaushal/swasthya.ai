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
    /// write bfs here
    const k = req.level;
    // console.log(
    //     "Hey, you're inside the function that we'll complete soon and taste glory!"
    // );
    // console.log(
    //     `You're checking level ${k} friends for the user ${req.profile.username} who has ID ${req.profile._id}.`
    // );
    const q = await new Queue();
    var user = req.profile._id;
    q.push(user);
    // console.log("you're prolly here 1");
    // q.push(user);
    // q.push(user);
    // console.log("you're prolly here 2");
    // console.log(`The length of the queue is ${q.length}.`);
    var visited = [];
    visited.push(JSON.stringify(user));
    // console.log(JSON.stringify(user));
    console.log(visited);
    var currLevel = 0;
    // var path = 0;
    while (q.length > 0) {
        console.log(`\nCovered ${currLevel} from root.`);
        console.log(`The queue has ${q.length} elements.`);
        // console.log(visited);
        
        var n = q.length;
        for (var j = 0; j < n; j++) {
            var x = "";
            if (currLevel % 2) {
                // currently at Blog Node
                x = await Blog.findById(q.pop(), "comments title").exec();
                console.log(`\nLooking at ${x.title} from the queue. Comments at this blog: `);
                // if (!visited.includes(x)) {
                if (visited.indexOf(JSON.stringify(x._id) === -1)) {
                    visited.push(JSON.stringify(x._id));
                    // console.log(`Visited ${x.title} .\n`);
                } 
                // else console.log(`Had already visited ${x.title}`);
            } 
            else {
                x = await User.findById(q.pop(), "comments username").exec();
                console.log(`\nLooking at ${x.username} from the queue. Comments by this user: `);
                // if (!visited.includes(x)) {
                if (visited.indexOf(JSON.stringify(x._id)) === -1) {
                    visited.push(JSON.stringify(x._id));
                    console.log(`Visited ${x.username} .\n`);
                }
                // else console.log(`Had already visited ${x.username}`);
            }
            // get X's comments
            for (com of x.comments) {
                var y = await Comment.findById(
                    com,
                    "commentedAt commentedBy body"
                ).exec();

                if (currLevel % 2) {
                    // currently at Blog Node
                    console.log(
                        `${y.body} was written by ${y.commentedBy} at ${x.title}.`
                    );
                    // if (!visited.includes(y.commentedBy)) {
                    if (visited.indexOf(JSON.stringify(y.commentedBy)) === -1) {
                        console.log(`Push this User for ${y.body}.`);
                        q.push(y.commentedBy);
                        // visited.push(y.commentedBy);
                    } 
                    else console.log(`Did not Push this User for ${y.body}.`);
                } else {
                    // currently at a User Node
                    // console.log(x.comments);
                    console.log(
                        `${y.body} was written by ${x.username} at ${y.commentedAt}.`
                    );
                    // if (!visited.includes(y.commentedAt)) {
                    // console.log(
                    //     "\n\nManually writing the code for this, checking."
                    // );
                    // console.log(visited);
                    // for (id of visited) {
                    //     console.log(Object.prototype.JSON.stringify.call(id));
                    //     console.log(Object.prototype.JSON.stringify.call(x._id));
                    //     if (id === JSON.stringify(x._id))
                    //         console.log(`${id} matched with ${JSON.stringify(x._id)}.`);
                    //     else console.log(`${id} did NOT match.`);
                    // }
                    if (visited.indexOf(JSON.stringify(y.commentedAt)) === -1) {
                        q.push(y.commentedAt);
                        // visited.push(y.commentedAt);
                    }
                }
            }

            // console.log(`Path ${currLevel} completed.`);
        }
        currLevel++;
        if (currLevel >= 2 * k ) break;
        // var x = q.pop();
    }

    // var ans = [];
    var ans = new Set;
    while(q.length){
        const x = await User.findById(q.pop(),'username _id').exec();
        // ans.push(x);
        ans.add(JSON.stringify(x));
    }

    // const d_ans = ([...set].map(item)) => {
    //     if (typeof item === 'string') return JSON.parse(item);
    //     else if (typeof item === 'object') return item;
    // };
    
    const d_ans = [];
    for( id of ans){
        if (typeof id === 'string') d_ans.push(JSON.parse(id));
        else if (typeof id === 'object') d_ans.push(id);
    }

    // var d_ans = new Map();
    // ans.forEach(object => {
    //     for (const key in object) {
    //         d_ans.set(key, object[key])
    //     }
    // })

    // console.log(ans);
    // var d_ans = [ ...new Set(ans) ];
    res.status(200).json({ users: d_ans });
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
