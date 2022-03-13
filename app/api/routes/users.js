// Requires
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { checkAuth } = require('../auth.js');

import { token } from 'morgan';
// imports
import User from '../models/user.js'
import EmqxAuthRule from '../models/emqx_auth_rule.js'

// Configs

// Routes

// methods
router.post('/login', async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        var user = await User.findOne({ 
            email: req.body.email
        });

        if (!user) {
            resJson.status = "failed";
            resJson.error= "Invalid Credentials";
            return res.status(401).json(resJson);
        }

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            resJson.status = "failed";
            resJson.error= "Invalid Credentials";
            return res.status(401).json(resJson);
        }
        
        user.set('password', undefined, { strict: false});
        var token = jwt.sign({ userData: user}, 'securePasswordHere', { expiresIn: 60 * 60 * 24 * 30 });
        resJson.token = token;
        resJson.userData = user;

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/register', async (req, res) => {
    var resJson = {
        status: "success"
    };
    
    try {
        var encryptedPassword = bcrypt.hashSync(req.body.password, 10);

        var newUser = {
            email: req.body.email,
            password: encryptedPassword,
            name: req.body.name
        };

        var user = await User.create(newUser);
        
        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/auth', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };
    
    try {
        var credentials = await getWebMqttCredentials(req.userData._id);

        resJson.username = credentials.username;
        resJson.password = credentials.password;
        
        res.json(resJson);

        setTimeout(() => {
            getWebMqttCredentials(req.userData._id);
        }, 5000);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/auth-reconnect', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };
    
    try {
        var credentials = await getWebMqttCredentialsForReconnect(req.userData._id);

        console.log(credentials);

        resJson.username = credentials.username;
        resJson.password = credentials.password;
        
        res.json(resJson);

        setTimeout(() => {
            getWebMqttCredentials(req.userData._id);
        }, 15000);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

async function getWebMqttCredentials(userId) {
    try {
        var rule = await EmqxAuthRule.find({ type:'user', serId: userId});

        if (rule.length == 0) {
            var newRule = {
                userId: userId,
                username: makeId(10),
                password: makeId(10),
                publish: [userId + '/#'],
                subscribe: [userId + '/#'],
                type: 'user',
                time: Date.now(),
                updatedTime: Date.now(),
            };

            var result = await EmqxAuthRule.create(newRule);

            return { 
                username: result.username, 
                password: result.password 
            };
        }

        var newUsername= makeId(10),
            newPassword= makeId(10);
        
        var result = await EmqxAuthRule.updateOne({ type: 'user', userId: userId }, { $set: { username: newUsername, password: newPassword, updatedTime: Date.now() }});

        if (result.modifiedCount == 1) {
            return { 
                username: newUsername, 
                password: newPassword 
            };
        } else {
            return null;
        }
    } catch (error) {
        console.log('ERROR getWebMqttCredentials');
        console.log(error);
        return null;
    }
}

async function getWebMqttCredentialsForReconnect(userId) {
    try {
        var rule = await EmqxAuthRule.find({ type:'user', serId: userId});

        if (rule.length == 1) {
            return { 
                username: rule[0].username, 
                password: rule[0].password 
            };
        }
    } catch (error) {
        console.log('ERROR getWebMqttCredentialsForReconnect');
        console.log(error);
        return null;
    }
}

function makeId(length) {
    // var text = '';
    // var characters =
    //     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // var charactersLength = characters.length;
    // for (var i = 0; i < length; i++) {
    //     result += characters.charAt(
    //         Math.floor(Math.random() * charactersLength),
    //     );
    // }
    // return result;
    return crypto.randomBytes(length).toString('hex');
}

module.exports = router;