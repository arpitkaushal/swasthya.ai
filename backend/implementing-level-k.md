a brief outline of what the get request to the following url would do 

    GET /users/:userId/level/:levelNo

this will start a BFS with source as {{userId}} say `u0` and get nodes a distance of 2*{{levelNo}} say `2*k`  (which will be users)

> pseudocode 

    intialize queue<comments>
    queue.push(u0);
    var path = 0;
    while(!queue.empty()){
        int n = queue.size();
        for(int j=0; j<n; j++){
            Node x = queue.pop();
            GET x's [comments]
            for(commentId in comments){
                GET comments/:commentId
                // counting path as the ones that we've completely covered, i.e. excluding the one that we're currently at
                // if we at odd path, then inner end point was of a blog, so comments connect them outwards to user node who commented on that blog  
                if(path%2) queue.push(commentId.commentedBy) iff commentedBy wasn't processed before

                // if we at even path, then inner end point was of users, so comments connect them outwards to the blog they commented at
                else queue.push(commentId.commentedAt) iff commentedAt wasn't processed before
            }
        }
        path++;
        if(path==2*k-1) break;  
    }
    var ans = []
    // what's left in the queue is level k friends
    while(queue.empty) 
        ans.push(queue.pop())





testing the API

well, there's just the test of getting level k friedns
    if we're doing this for every level k, we could consider caching the previous level
    say level k-1 so that we don't make it O(e^2) where e is an edge/comment 


automating DB creation 

we want to create POST requests for 
blog - create p posts

    for testing purpose we'll ignore the requireSignIn middleware
    path to create new blog is POST /blog/new/:userId   since blogAuthor and commenters don't share a relationship, we can choose userId as we wish (static i.e. {{u_1}} or {{u_j}})
    req.body: 
    {
        "title":{{bt}}
        "body":"anything"
    }
    here `bt` will be a postman variable indicating blog title 
    we'll put this inside the forloop { bt = "b" + i} where i will run from 0 to p giving the ith blog a title "b<i>"
    for every blog we'll get a response, a DB object that'll have blogId. we'll store blogId(s) in an array `b` glbally available

user signups - create q users 
    
    path to create new user is POST /signup 
    req.body: 
    {
        "username":{{un}}
        "password":"anything"
    }
    here `un` will be a postman variable indicating username
    we'll put this inside the forloop { un = "u" + i} where i will run from 0 to p giving the ith user a username "u<i>"
    for every user we'll get a response, a DB object that'll have userId. 
    we'll store userId(s) in an array `u` glbally available. this way we can refer to jth user as {{u[j]}} which is the ID of user with username "u<j>" 



comments - create r comments

    path to create new comment is POST /comment/:blogId/:userId/ 
    
    for blogID and userID we'll run a forloop from 0 to r (the num of comments to generate)
    making sure the copies of arrays containing blogIds and userID are such that the kth element in commUser[] and kth element in commBlog[] are such that c_k connects the two. 
    e.g. if you want c14 to be the comment made by u5 on b89
    then commUser[14] = {{u[5]}} and commBlog[14] = {{b[89]}}
    {{ }} denote the value (in this case Id) associated with that variable 
    
    for every commment post the following req.body to corresponding path (which changes dynamically with the loop)

    req.body: 
    {
        "body":{{cb}}
    }
    here `cb` will be a postman variable indicating comment body
    we'll put this inside the forloop { cb = "c" + i} where i will run from 0 to r giving the ith comment a comment body that reads "c<i>"
    for every blog we'll get a response, a DB object that'll have commentId. (internally it will also append it's ID to the comments list of blog and user) 
    we'll store commentId(s) in an array `c` glbally available. this way we can refer to jth comment as {{c[j]}} which is the ID of comment with comment body "c<j>" 
