const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String,
    }],
});

let User;

function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB);

        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

async function registerUser(userData) {
    try {
        if (userData.password !== userData.password2) {
            throw new Error('Passwords do not match');
        }

        const hash = await bcrypt.hash(userData.password, 10);
        userData.password = hash;

        let newUser = new User(userData);
        await newUser.save();
        
        return Promise.resolve('User registered successfully');
    } catch (err) {
        if (err.message === 'Passwords do not match') {
            return Promise.reject(err.message);
        } else if (err.code === 11000) {
            return Promise.reject('User Name already taken');
        } else {
            return Promise.reject(`There was an error creating the user: ${err}`);
        }
    }
}

    

async function checkUser(userData) {
    try {
        const users = await User.find({ userName: userData.userName });

        if (users.length === 0) {
            throw new Error(`Unable to find user: ${userData.userName}`);
        }

        const result = await bcrypt.compare(userData.password, users[0].password);

        if (!result) {
            throw new Error(`Incorrect Password for user: ${userData.userName}`);
        }

        if (users[0].loginHistory.length === 8) {
            users[0].loginHistory.pop();
        }
        users[0].loginHistory.unshift({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });

        await User.updateOne({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } });
        
        return Promise.resolve(users[0]);
    } catch (err) {
        return Promise.reject(err.message || `There was an error verifying the user: ${err}`);
    }
}

module.exports = {
    initialize,
    registerUser,
    checkUser,
};
