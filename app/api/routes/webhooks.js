// Requires
const express = require("express");
const router = express.Router();
const axios = require('axios');
const crypto = require("crypto");
const { checkAuth } = require('../auth.js');
var mqtt = require('mqtt');

// imports
import Device from '../models/device.js'
import Data from '../models/data.js'
import Notification from '../models/notification.js'
import AlarmRule from '../models/emqx_alarm_rule.js'
import Template from '../models/template.js';
import EmqxAuthRule from '../models/emqx_auth_rule.js';

// Configs
var mqttClient;

// Routes

// methods
router.post('/saver', async (req, res) => {
    var resJson = {
        status: 'success'
    };
    
    try {
        if (req.headers.token != process.env.API_TOKEN) {
            res.sendStatus(404);
            return;
        }

        var data = req.body;
        var topic = data.topic.split('/');
        var deviceId = topic[1];
        var variable = topic[2];
        
        var result = await Device.find({ id: deviceId, userId: data.userId });

        if (result.length == 1) {
            Data.create({
                userId: data.userId,
                deviceId: deviceId,
                variable: variable,
                value: data.payload.value,
                createdTime: Date.now()
            });
        }
        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/alarm', async (req, res) => {
    var resJson = {
        status: 'success'
    };

    try {
        if (req.headers.token != process.env.API_TOKEN) {
            res.sendStatus(404);
            return;
        }

        var data = req.body;

        updateAlarmCounter(data.emqxRuleId);
        
        var lastNotification = await Notification.find({
          deviceId: data.deviceId,
          emqxRuleId: data.emqxRuleId
        })
          .sort({ createdTime: -1 })
          .limit(1);

        if (lastNotification.length == 0) {
            saveNotification(data);
            sendMqttNotification(data);
        } else {
            var lastNotificationTime = Date.now() - lastNotification[0].createdTime; //millis

            if (lastNotificationTime > data.triggerTime) {
                saveNotification(data);
                sendMqttNotification(data);
            }
        }

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/auth', async (req, res) => {
    var resJson = {
        status: 'success'
    };

    try {
        var deviceId = req.body.deviceId;
        var password = req.body.password;

        var device = await Device.findOne({ deviceId: deviceId });

        if (!device) {
            resJson.status = 'failed';
            resJson.error = 'Invalid credentials';
            return res.status(401).json(resJson);
        }

        if (password != device.password) {
            resJson.status = 'failed';
            resJson.error = 'Invalid credentials';
            return res.status(401).json(resJson);
        }

        var userId = device.userId;

        var credentials = await getDeviceMqttCredentials(deviceId, userId);
        var template = await Template.findOne({ _id: device.templateId });

        var variables = [];

        template.widgets.forEach(widget => {
            variables.push((({
                variable,
                variableName,
                variableType,
                variableFreq
            }) => ({
                variable,
                variableName,
                variableType,
                variableFreq
            }))(widget));
        });

        resJson.data = {
            username: credentials.username,
            password: credentials.password,
            topic: userId + '/' + deviceId + '/',
            variables: variables
        };

        res.json(resJson);

        setTimeout(() => {
            getDeviceMqttCredentials(deviceId, userId);
            console.log('Device credentials updated');
        }, 10000);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

async function saveNotification(alarm) {
    try {
        var notification = alarm;
        notification.createdTime = Date.now();
        notification.readed = false;

        return await Notification.create(notification);
    } catch (error) {
        console.log('**** ERROR WEBHOOKS saveNotification ****');
        console.log(error);
        return null;
    }
}

async function updateAlarmCounter(alarm) {
    try {
        return await AlarmRule.updateOne(
          { emqxRuleId: alarm.emqxRuleId },
          { $inc: { counter: 1 } }
        );
    } catch (error) {
        console.log('**** ERROR WEBHOOKS updateAlarmCounter ****');
        console.log(error);
        return null;
    }
}

async function getDeviceMqttCredentials(deviceId, userId) {
    try {
        var rule = await EmqxAuthRule.find({
            type: 'device',
            userId: userId,
            deviceId: deviceId
        });

        if (rule.length == 0) {
            var newRule = {
                userId: userId,
                deviceId: deviceId,
                username: makeId(10),
                password: makeId(10),
                publish: [userId + '/' + deviceId + '/+/sdata'],
                subscribe: [userId + '/' + deviceId + '/+/actdata'],
                type: 'device',
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

            var result = await EmqxAuthRule.updateOne(
                {
                    type: 'device',
                    userId: userId,
                    deviceId: deviceId
                },
                {
                    $set: {
                        username: newUsername,
                        password: newPassword,
                        updatedTime: Date.now()
                    },
                }
            );
        
        if (result.modifiedCount == 1) {
            return { 
                username: newUsername, 
                password: newPassword 
            };
        } else {
            return null;
        }
    } catch (error) {
        console.log('**** ERROR WEBHOOKS getDeviceMqttCredentials ****');
        console.log(error);
        return null;
    }
}

function makeId(length) {
    // var result = "";
    // var characters =
    //     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // var charactersLength = characters.length;
    // for (var i = 0; i < length; i++) {
    //     result += characters.charAt(
    //         Math.floor(Math.random() * charactersLength)
    //     );
    // }
    // return result;
    return crypto.randomBytes(length).toString('hex');
}

function sendMqttNotification(alarm) {
    try {
        var topic = 
            alarm.userId   + '/' + 
            alarm.deviceId + '/' + 
            alarm.variable + '/notif';

        var msg = 'The rule: when the ' + 
            alarm.variableName + ' is ' + 
            alarm.condition + ' than ' + 
            alarm.value;

            mqttClient.publish(topic, msg);
    } catch (error) {
        console.log('**** ERROR WEBHOOKS sendMqttNotification ****');
        console.log(error);
        return null;
    }
}

function startMqttClient() {
    var options = {
        port: process.env.MQTT_PORT,
        host: process.env.MQTT_TCP_PORT,
        clientId: 'webhook_user' + Math.round(Math.random() * 10000),
        username: process.env.EMQX_SUPERUSER_USER,
        password: process.env.EMQX_SUPERUSER_PASS,
        keepalive: 60,
        reconnectPeriod: 5000,
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clean: true,
        encoding: 'utf8'
    };

    var mqttUrl = process.env.MQTT_SSL_TCP + options.host;

    mqttClient = mqtt.connect(mqttUrl, options);

    mqttClient.on('connect', () => {
        console.log('MQTT CONNECTION -> SUCCESS;');
        console.log('\n');
    });

    mqttClient.on('reconnect', (error) => {
        console.log('RECONNECTING MQTT ->');
        console.log(error);
    });

    mqttClient.on('error', (error) => {
        console.log('MQTT CONNECTION FAIL -> ');
        console.log(error);
    });
}

setTimeout(() => {
    startMqttClient();
}, 3000);

module.exports = router;