const express = require("express");
const {
    userById,
    allUsers,
    getUser,
    updateUser,
    deleteUser,
    displayUser,
    setLevelNum,
    getLevelFriends
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

const router = express.Router();

router.get("/users", allUsers);
router.get("/user/:userId", getUser);
router.get("/users/:userId/level/:levelNum", getLevelFriends);

// router.get("/user/:userId", displayUser);
router.put("/user/:userId", requireSignin, updateUser);
router.delete("/user/:userId", requireSignin, deleteUser);

// any route containing :userId, our app will first execute userByID()
router.param("userId", userById);
router.param("levelNum", setLevelNum);

module.exports = router;
