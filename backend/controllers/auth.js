const jwt = require("jsonwebtoken");
require("dotenv").config();
const expressJwt = require("express-jwt");
const User = require("../models/user");

exports.signup = async (req, res) => {
    const userExists = await User.findOne({ username: req.body.username });
    if (userExists)
        return res.status(403).json({
            error: `Username ${req.body.username}  is taken. Please choose another one!`,
        });
    const user = await new User(req.body);
    await user.save();
    res.status(200).json({
        message: `Signup success! Your username is ${req.body.username} . Please login using your credentials.`,
        userId: user._id,
        username: user.username
    });
};

exports.signin = (req, res) => {
    // find the user based on username
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
        // if err or no user
        if (err || !user) {
            return res.status(401).json({
                error: "User with that username does not exist. Please signup.",
            });
        }
        // if user is found make sure the username and password match
        // create authenticate method in model and use here
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password do not match",
            });
        }
        // generate a token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        // persist the token as 't' in cookie with expiry date
        res.cookie("t", token, { expire: new Date() + 9999 });
        // return response with user and token 
        const { _id, name, username } = user;
        return res.json({
            message: `Welcome ${user.username} ! You've signed in successfully.`,
            token,
            user: { _id, username, name },
        });
    });
};  

exports.signout = (req, res,next) => {
    res.clearCookie("t");
    return res.json({ message: "Signed Out successfully!" });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",
});