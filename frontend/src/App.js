import React, { useState, useEffect } from "react";
const usersURL = "http://localhost:8081/users/";

/**
 * For every user we want to display their username and the time they joined the platform
 * From GET localhost:8081/users/ we'll get an array of User objects
 * each User containing {username, comments, created}
 */
const User = (props) => {
    const user = props.user;
    return (
        <div>
            userName : {user.username} <br />
            Joined : {user.created} <br />
        </div>
    );
};

const DisplayUsers = (props) => {
    var users = props.users;
    // console.log(users);
    var body = [];
    // console.log(users.length);
    console.log(users);
    for (var i = 0; i < users.length; i++) {
        body.push(<User key={users[i].username} user={users[i]} />);
    }
    console.log(body);
    return body;
};

const App = () => {
    const [users, setUserData] = useState({});

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
      const res = await fetch(usersURL);
      const jsonData = await res.json();
      setUserData(jsonData);
    };

    // console.log(users)
    // const users = [];
    return (
        <div>
            <center>
                <p>Level-K Friends</p>
                <DisplayUsers users={users} />
            </center>
        </div>
    );
};

export default App;
