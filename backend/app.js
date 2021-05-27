// set up the app
const express = require("express");
const app = express();

// misc dependencies
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

// Connect to DB
const mongoose = require("mongoose"); //manages DB connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log("DB Connected")) // if successful
    .catch((e) => console.log(`DB connection Error: ${e}`)); // if not successful
//

// bring in routes
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const commentRoutes = require("./routes/comment");

// apiDocs - JSON response to see routes/methods available with the API
app.get("/", (req, res) => {
    fs.readFile("docs/apiDocs.json", (err, data) => {
        if (err) {
            res.status(400).json({
                error: err,
            });
        }
        const docs = JSON.parse(data);
        res.json(docs);
    });
});

// middlewares

// to get stats on API requests
const morgan = require("morgan");
app.use(morgan("dev"));

// for processing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const expressValidator = require("express-validator");
app.use(expressValidator());

// Cross-Origin Resource Sharing aka cors to enable requests from frontend client
const cors = require("cors");
app.use(cors());

// routers to execute the endpoints
app.use("/", blogRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", commentRoutes);

app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: "Unauthorized!" });
    }
});

const port = process.env.PORT || 5000 || 8081;
app.listen(port, () => {
    console.log(`App running on port: http://localhost:${port}`);
});
