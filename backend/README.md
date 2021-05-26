# swasthya.ai
Modelling a social media network using MERN. 

# Running the App

0. Prerequisite - Node must be installed on your system.
1. Run `npm install` in the root of the project.
2. Setup Environment Variables
   1. A dummy `.env1` file is included in the root of the project folder. Rename this file i.e. `.env1` to `.env` .
   2. Replace `<db_user>` and `<password>` in the parameter `MONGO_URI` with your own connection string for MongoDB database.
   3. Set the value of `JWT_SECRET` as any string of your choice, just make sure it's atleast 10 chracters long, and only accessible to you. This is used to create login tokens. 
3. Run `npm run dev` for development run (i.e. with `nodemon`) or run `node app.js` if you don't wish to make any changes to the files.
4. You should see a JSON response at `http://localhost:8081` or the `PORT` you've chosen. *This route lists the various endpoints available with the API.* 
5. Checkout files in `routes` folder for a better overview of middleware and commands. 

# High Level Idea 

Task at hand, retrieve `k-level` friends for a given user as described in `taskDescription.md`.

1. This can be modelled as a graph problem where the `level-k` friendship between two users would mean that the shortest (in terms of components, as all edges weight the same) path between them is propotional to `k`. It's actually `2*k` the way I have modelled, please read ahead. 
2. Both Blogs and Users are nodes in this graph. They have their usual properties as defined in the files of `./models/`, however, both of them have an *array* of `comments`. 
3. Say, user `u1` comments at blog `b3`. This comment object will be stored to database with it's body as well as two other params, namely who-commented, and where-commented. Once this comment is saved to the DB and we get an ID for it, we updated the comments array in both the blog and the user by this ID. This models an undirected edge between the two nodes.
4. Now, in this setup you'll realize that every user is only immidieatly connected to a blog (i.e. each of the blogs that they commented on), and each blog is only immideatly connected to a user (i.e. each of the user who commented on the blog). 
5. For a user, every node at odd distance is a blog, and every node at even distance is a user. So, in the above setup, Level 1 friends of u1 would be all nodes at 2*(1) distance. Or more generally level-k friends of u1 would be all nodes at 2*(k) distance.
6. How to get nodes at 2*(k) distance from a user? Run breadth first search. Edges are comments. The comments array in the nodes (either of blog/user) is in fact an adjacency list. 
7. Example for getting Level-1 friends of u1
   1. Get the comments array for u1 and iterate through it.
   2. For every comment in comments, push the node (blog, say b_i) it links the current node (u1) to into the queue. 
   3. All comments of u1 have been processed, and all blogs that it has commented on have been pushed to the queue.
   4. For every comment in comments array of b_i, push the node (user, say u_j) it links the current node (b_i) to into the queue. Pop b_i.
   5. After all b_i have been popped, we're left with Level-1 friends in the queue. And so, after every 2*k-1 runs, we'll be left with the level-k friends in the queue.




### Archive - Rough Ideas

Blogs will be make an edge between every two users who have commented on it. 
So, say blog b1 was commented on by users u1,u2,u3 then.

Hmm, how will we do this? 

- blogs are nodes, users are nodes. 
- edges exist between users and blogs and nothing else. 
- these edges are undirected. 
- suppose we have three blogs-1,2,3 and five users-1,2,3,4,5
- all are nodes in our graph
- now u1 comments on b1, so there's an edge from b1 to u1
- how to model this edge'
- we want the edge i.e. comment to add u1 to b1's adjaceny list and b1 to u1's adjacency list. hmm so to do that, whether we should create comment objects independent of a blog/user and add their ID as reference to 'comments' params in both the blog and the user.
    - what will be the cost of getting comments from a user. just go to it's comments list, read their id, adn just GET them
    - cost of getting comments of a blog. just go to it's comment list, read their IDs,and just GET them.
    - huh, so there is some overhead (but it's a constant number, but that doesn't mean it's justified, but our api's primary purpose is to serve to find level of friends, if we had data on how many times GET requests to a blog/user are made, i could have considered the option of tying comments to a blog and/or user. but you know if i just tied them to one of the two, GET for the other one would have a linear search costly, which could be ugly in case of large number of either blog/comments. Thus, comments as separate objects work better i think.)   
- in blogSchema: comments: postedBy:



#### how to use comments as a separate object 
- commentSchema
- props: whichBlog, whoWasUser, ID, text
- so, how does someone (a user) comment on a blog?
- they use some command, "-comment" or something, followed by "Some text" and "whichBlog" and then that creates a new comment object, returns the ID of the newly generated comment.
- this ID is then appended to lists blog:comments and user:comments

agar aisa hai then how does will the adjacenecy list work?
- i make a request to get level-1 friends of u1
- mai u1 ke comments list mein gaya, har comment go GET karke uska blogID (unique, because ek hi blog pe multiple comments ho sakte hai) nikala, queue mein append kardia. ek paas ho gaya. ab queue ke elements (jo ki blogs hai) unko ek ek karke process kia, so b_i ke comments list pe age, comments ko unki ID se get kia, and usme me se userID nikali and queue me push kar dia. do this for all comment IDs of b_i and do until all blogs done. 
- what remains in the queue are your level 1 friends. 
- similarly you continue for level-k friends

level-K friends ke bech mein 2*K edges hongi (comments being an edge)



users bhi create karne honge yaar
how will a user be referred, using his username? or mongo-wali-ID ? 


why comments as separate objects in 

intially proposed solution 
fusing blogId as an edge betwen users who comment on the same blog. so, that creates a complete sub graph for that set of users. i.e. jC2 edges on the ith blog with j users who commented on it.  