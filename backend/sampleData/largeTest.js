const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const url = `http://localhost:${process.env.PORT}`;

axios({
    method:"post",
    url : url,
    data: {
        username:"u70",
        password:"hello1"
    }
})
.then (data=>console.log(data))
.catch(err=>console.log(err));
