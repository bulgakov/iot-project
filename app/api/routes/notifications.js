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
        var devices = await Device.find({ userId: req.userData._id });
        var alarms = await AlarmRule.find({ userId: req.userData._id });
        var result = [];

        for (let i = 0; i < notifications.length; i++) {
            var device = devices.filter(a => a.deviceId == notifications[i].deviceId)[0];
            var alarm = alarms.filter(a => a.emqxRuleId == notifications[i].emqxRuleId)[0];
            result.push({
                _id: notifications[i]._id,
                userId: notifications[i].userId,
                deviceId: notifications[i].deviceId,
                deviceName: device ? device.name : null,
                emqxRuleId: notifications[i].emqxRuleId,
                payload: notifications[i].payload,
                topic: notifications[i].topic,
                variable: notifications[i].variable,
                variableName: alarm ? alarm.variableName : null,
                value: notifications[i].value,
                condition: notifications[i].condition,
                readed: notifications[i].readed,
                createdTime: notifications[i].createdTime
            });
        }

        resJson.data = result;
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
        
        var result = await Notification.updateOne(
          { userId: req.userData._id, _id: req.body.id },
          { readed: true }
        );

        resJson.data = result;
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