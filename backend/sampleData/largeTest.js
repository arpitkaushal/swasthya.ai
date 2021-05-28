const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const dataPath = "G:/Desktop/may/swastya.ai_new/backend/sampleData/largeData/"

var test = "1";

// /* For users
const setupUsers = async (userStart,userEnd) => {
    const signupURL = `http://localhost:8081/signup`;
    var x = "";
    var i=0;
    for(i=start; i<=userEnd; i++){
        await axios({
            method:"post",
            url : signupURL,
            data: {
                username:"u"+i,
                password:"hello1"
            }
        })
        .then(data=>{
            // console.log(data.data);
            const us = (data.data.username);
            const usId = (data.data.userId);
            // x = us+" "+usId+"\n";
            x = usId+"\n";
            console.log(x);
        })
        .then(fs.writeFile(dataPath+'users'+test+'.txt',x, { flag: 'a+' }, (err) => {if(err) console.log(err)}))
        .catch(err=>console.log(err.data));
    }
}
// */


// /* For blogs
const setupBlogs = async (start,totalBlogs,author) => {
    
    const blogURL = `http://localhost:8081/blog/new/${author}`;
    var x = "";
    var i=0;
    for(i=start; i<=start+totalBlogs; i++){
        await axios({
            method:"post",
            url : blogURL,
            data: {
                title:"b"+i,
                body:"something"
            }
        })
        .then(data=>{
            const bl = (data.data.result.title);
            const blId = (data.data.result._id);
            // x = bl+" "+blId+"\n";
            x = blId+"\n";
            console.log(x);
            
        })
        .then(fs.writeFile(dataPath+'blogs'+test+'.txt',x, { flag: 'a+' }, (err) => {if(err) console.log(err)}))
        .catch(err=>console.log(err.data));
    }

}
// */


// /* For Comments
const fs = require("fs").promises;


const setupComments = async (userStart,commPerUser) => {
    
    var users=[];
    var blogs=[];
    
    const userText = await fs.readFile(dataPath+'users'+test+'.txt', 'utf-8', (e,d) => {
        if(e) return console.log(e);
        return d;
    });
    const blogText = await fs.readFile(dataPath+'blogs'+test+'.txt', 'utf-8', (e,d)=>{
        if(e) return console.log(e);
        return d;
    });
    users = userText.split("\n");
    blogs = blogText.split("\n");
    // console.log(users);
    // console.log(blogs);
    
    var commentURL="http://localhost:8081/comment";
    var x = "",url="";
    var i=0; j=0, k=0;
    var J = blogs.length-1, U = users.length-1;
    var commNum=userStart*commPerUser;
    for(i=userStart; i<=U; i++){
        for(var m = 0; m<commPerUser; m++){
            j = Math.floor((Math.random() * J));    // select the jth blog
            url = `${commentURL}/${blogs[j]}/${users[i]}/`;
            // console.log(url);
            commNum++;
            await axios({
                method:"post",
                url : url,
                data: {
                    body:"c"+commNum,
                }
            })
            .then(data=>{
                // console.log(data);
                const cm = (data.data.result.body);
                const cmId = (data.data.result._id);
                x = cm+" "+cmId+"\n";
                // console.log(x);
                if(commNum%10000 === 0) console.log("10k comments posted.")
            })
            .then(fs.writeFile(dataPath+'comments'+test+'.txt',x, { flag: 'a+' }, (err) => {if(err) console.log(err)}))
            .catch(err=>console.log(err.data));

        }
    }
}

// */


test = "1";
const userStart = 10001, userEnd = 100000;
setupUsers (userStart,userEnd);
// setupBlogs(1,10000,"60b132721ab6065ba4f786a1");
// setupComments(userStart,10);

