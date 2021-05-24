# swasthya.ai
Modelling a social media network using MERN. 


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



# how to use comments as a separate object 
- commentSchema
- props: whichBlog, whoWasUser, ID, text
- so, how does someone (a user) comment on a blog?
- they use some command, "-comment" or something, followed by "Some text" and "whichBlog" and then that creates a new comment object, returns the ID of the newly generated comment.
- this ID is then appended to lists blog:comments and user:comments

agar aisa hai then how does will the adjacenecy list work?
- i make a request to get level-0 friends of u1
- mai u1 ke comments list mein gaya, har comment go GET karke uska blogID (unique, because ek hi blog pe multiple comments ho sakte hai) nikala, queue mein append kardia. ek paas ho gaya. ab queue ke elements (jo ki blogs hai) unko ek ek karke process kia, so b_i ke comments list pe age, comments ko unki ID se get kia, and usme me se userID nikali and queue me push kar dia. do this for all comment IDs of b_i and do until all blogs done. 
- what remains in the queue are your level 1 friends. 
- similarly you continue for level-k friends

level-K friends ke bech mein 2*K edges hongi (comments being an edge)



users bhi create karne honge yaar
how will a user be referred, using his username? or mongo-wali-ID ? 
