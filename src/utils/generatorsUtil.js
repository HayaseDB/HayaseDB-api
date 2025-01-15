const {USERNAME_LIST} = require("./usernameList");
const User = require("../models/userModel");
const crypto = require('crypto');


const generateUsername = async () => {
        let username;
        let isTaken = true;

        while (isTaken) {
            const randomWord = USERNAME_LIST[Math.floor(Math.random() * USERNAME_LIST.length)];
            const randomSuffix = crypto.randomInt(1, 1000);
            username = `${randomWord}${randomSuffix}`;

            isTaken = await User.unscoped().findOne({where: {username}});

        }
        return username
}

module.exports = {generateUsername};
