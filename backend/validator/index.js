exports.createBlogValidator = (req, res, next) => {
    // title
    req.check("title", "Write a title").notEmpty();
    req.check("title", "Title must be between 2 to 150 characters").isLength({
        min: 2,
        max: 150,
    });
    // body
    req.check("body", "Write a body").notEmpty();
    req.check("body", "Body must be between 2 to 2000 characters").isLength({
        min: 2,
        max: 2000,
    });
    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware
    next();
};

exports.createCommentValidator = (req, res, next) => {
    // body
    req.check("body", "Write a body").notEmpty();
    req.check("body", "Body must be between 2 to 2000 characters").isLength({
        min: 2,
        max: 2000,
    });
    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware
    next();
};

exports.userSignupValidator = (req, res, next) => {
    // name is not null and between 2-10 characters
    req.check("username", "Username is required").notEmpty();
    // Username is not null, valid and normalized
    req.check("username", "Username must be between 2 to 32 characters").isLength({
        min: 2,
        max: 32,
    });
    // check for password
    req.check("password", "Password is required").notEmpty();
    req.check("password")
        .isLength({ min: 6 })
        .withMessage("Password must contain at least 6 characters")
        .matches(/\d/)
        .withMessage("Password must contain a number");
    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware
    next();
};

exports.userSigninValidator = (request, response, next) => {
    request
        .check("username", "Username must be between 2 to 32 characters")
        .withMessage("Please a valid username")
        .isLength({
            min: 2,
            max: 32,
        });
    request.check("password", "Please enter the password.").notEmpty();
    request
        .check("password")
        .isLength({ min: 6 })
        .withMessage("Username and password don't match!");
    const errors = request.validationErrors();
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};
