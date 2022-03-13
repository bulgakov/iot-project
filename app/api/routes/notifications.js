// Requires
const express = require("express");
const router = express.Router();
const axios = require('axios');
const { checkAuth } = require('../auth.js');
var mqtt = require('mqtt');

// imports
import Device from '../models/device.js'
import Data from '../models/data.js'
import Notification from '../models/notification.js'
import AlarmRule from '../models/emqx_alarm_rule.js'

// Configs

// Routes

// methods
router.get('/', checkAuth, async (req, res) => {
    var resJson = {
        status: 'success'
    };

    try {
        
        var notifications = await Notification.find({ userId: req.userData._id, readed: false });

        resJson.data = notifications;
        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.put('/', checkAuth, async (req, res) => {
    var resJson = {
        status: 'success'
    };

    try {
        
        var res = await Notification.updateOne(
          { userId: req.userData._id, _id: req.body.id },
          { readed: true }
        );

        resJson.data = res;
        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

module.exports = router;