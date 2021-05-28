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

# SetUp DataBase and Tests
1. `cd` to `sampleData` and run `mongorestore --uri <MONGO_URI you used in .env>/<new_db_name> swasthya_ai` . If your DB is on Atlas, use that URI. For a local Mongo server, the command will look like `mongorestore --uri mongodb://localhost:27017/<your_DB_name> swasthya_ai`. Of course, MongoDB Tools must be installed on your system.
2. [Use this [preConfigured Postman Collection]((https://www.getpostman.com/collections/eb08d16f269c1cb6c4dc)) for different API calls and variables corresponding to `sampleData`.
3. If you want to play around with the DB without the API, you may use `testQueries.mongodb` file.

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




Three considerations - 
Ideal scenario ? More Blogs than we have users i.e. users create multiple blogs and multiple comments. And each user comments on more blogs than they compose themselves.

# Analysis of Different Models
## Blogs/Comments as edges, Users as nodes. Comments, Blogs will be separate objects still. 
Comments will be tied to blogs, assuming (rightly so I think) their IDs can be accessed independently.

1. **Create** Consider n blogs. For the ith blog, let's say there are j users who have commented (so, total comments >= j as a user can make multiple comments. for multiple comments we can avoid modelling another edge, because of the overhead that I'll discuss now), so there will be jC2 edges that connect j users in the graph, this is a complete graph for these j users. Now, let's say (j+1)th user comments on the ith blog, so, we need to j new edges to connect the j+1 th user to the jth user. So, for every new comment updates will have to be made to all the previous users, which will be a costly operation. Moreover, to aboid multiple edges between two users that have more than one common blog, we'll have to make checks so that we don't add another edge between them (why not? what's the harm in multiple edges in this case? Maybe because we have chosen an adjacency matrix in this case, as discussed later, each entry in this matrix will instead be a vector, and that increases the spatial and time costs for delete operations.). 
2. **Delete** The adjacency list in this case would be very dense. Hmm, maybe we can use a adjacency matrix instead since our graph will not be sparse. But if we delete a comment, we'll have to update the matrix corresponding to that comment, and thus the level-1 friendships because of that comment. This necessasitates the modelling of multiple edges, so that if a user who has 2 comments on a blog and chooses to delete one of them, their level-1 friendshpis resulting from that blog are not revoked. Not until all of their comments have been deleted. But for this use case, we can instead store not commentIDs in each cell but just pairs {bi,< numComments >}, and decrement count. If the count reches zero, that's when we update (revoke) friendships coming from that blog. However, in case of more than one common blog with a user on that blog, we don't wish to remove the level-1 friendship, and thus again, we'll need a vector of such pairs. Mainting a vector in DB for each cell will be costly on space.  But it might be fast for time operations? Also, why such a fuss about deleting comments, well, users may want to make delete.
3. **Update** Since we're modelling comments as objects, so we'll be storing IDs and thus updates to the body of comment will be O(1) operations.
4. **Read** We can have two types of reads here, comments on a blog, or comments by a user. (Of course, you could have just reads for comments using IDs but no one does that). 
   1. Getting comments for a Blog would be O(k) where k is the number of comments on that blog.
   2. Getting comments for a User would be O(p) where p is the number of users on our website. [ I assumed that this could be a possible demand of a the platform, where users check up on other users by viewing comments centrally on their profile. ] In this model, we are not tying comments as an array to a user since that's what we'd do in case of adjacency lists, we have matrix instead. So, you'll have to traverse an entire row/colomn (either works because undirected edges, symmetric matrix) and check for comments. However, this will be a redundant step, because there are multiple entries for the same comment in the matrix, and thus you'd have to keep checking if you've seen this comment before or not. In this case you won't be able to use the proposed schema for each cell entry in Point-2, and use something like [ {bi, [ arrayCommentIds ]}, {bj, [ arrayCommentIds ]} ]. Which increases the complexity. Another solution could be to just maintainan array of commentIds for the user. Yeah, that'll be better than this. But now delete operations would be costly because of the updates in the friendships that you'll have to make. 
5. **Getting Friendships** Complexity with Adjacency List is O(V+E) and matrix is O(V^2), so if we have users who comment A LOT (i.e. each user on average has more comments than the total number of users), then getting friendships will be faster with a matrix than a list. But this advantage will be lost as soon as you start getting some less active users (who have numComments < numUsers). And so, this puts a pressure on the user to comment else this operation becomes costly. We don't want that, our system should not assume/impose/depend on user activity at this degree. So, commenting less detroites performance here. And then we've already discussed the possibility of mainataining adjacency lists in Point-2.



## Blogs and Users as nodes, Comments edges. Comments, Blogs, Users are separate objects. 
> This is the one implemented on this repo

1. **Create** 
2. **Delete** 
3. **Update** 
4. **Read** 
5. **Getting Friendships** 






# Archive - Rough Ideas

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

