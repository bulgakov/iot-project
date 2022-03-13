// Requires
const express = require("express");
const router = express.Router();
const axios = require('axios');
const { checkAuth } = require('../auth.js');

// imports
import Device from '../models/device.js'
import AlarmRule from '../models/emqx_alarm_rule.js'

// Configs
const emqxConfig = {
    auth: {
        username: 'admin',
        password: process.env.EMQX_DEFAULT_APP_SECRET
    }
};

const apiUrl = process.env.EMQX_API_URL + '/rules';

// Routes

// methods
router.get('/', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        var alarms = await AlarmRule.find({ userId: req.userData._id });

        resJson.data = alarms; 

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/', checkAuth, async (req, res) => {
    var resJson = {
        status: "success",
    };

    try {
        var userId = req.userData._id;
        var newRule = req.body;
        newRule.userId = userId;
        newRule.createdTime = Date.now();

        var alarm = await createAlarmRule(newRule);
        
        if (alarm) {
            resJson.data = alarm;
            res.json(resJson);    
        } else {
            resJson.status = "failed";
            res.status(500).json(resJson);
        }
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.put('/', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        // var result = await selectDevice(req.userData._id, req.body.deviceId);
        // if (!result) {
        //     resJson.status = "failed";
        // }

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.put('/status', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        var rule = req.body;

        resJson.data = await updateAlarmRuleStatus(rule.emqxRuleId, rule.status);

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.delete('/', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        var result = await deleteAlarmRule(req.userData._id, req.query.emqxRuleId);

        resJson.data = result; 

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

// functions
async function createAlarmRule(newAlarm) {
    try {
        var topic = newAlarm.userId + '/' + newAlarm.deviceId + '/' + newAlarm.variable + '/sdata';
        var rawsql = 
            'SELECT username, topic, payload ' + 
            'FROM "' + topic + '" ' + 
            'WHERE is_not_null(payload.value) AND ' + 
            getConditionValue('payload.value', newAlarm.condition, newAlarm.value);

        var newRule = {
            rawsql: rawsql,
            actions: [
                {
                    name: 'data_to_webserver',
                    params: {
                        $resource: global.saverResource.id,
                        payload_tmpl:
                            '{ ' +
                                '"userId": "' + newAlarm.userId + '",' +
                                '"payload": ${payload},' +
                                '"topic": "${topic}"' +
                            '}'
                    }
                }
            ],
            description: 'ALARM-RULE',
            enabled: newAlarm.status
        };

        var  resEMQX = await axios.post(apiUrl, newRule, emqxConfig);

        if (resEMQX.status === 200 && resEMQX.data.data) {
            
            var alarm = await AlarmRule.create({
                userId: newAlarm.userId,
                deviceId: newAlarm.deviceId,
                emqxRuleId: resEMQX.data.data.id,
                variableName: newAlarm.variableName,
                variable: newAlarm.variable,
                value: newAlarm.value,
                condition: newAlarm.condition,
                triggerTime: newAlarm.triggerTime,
                status: newAlarm.status,
                counter: 0,
                createdTime: Date.now()
            });

            var payload_tmpl =
            '{ ' +
                '"userId": "' + alarm.userId + '",' +
                '"deviceId": "' + alarm.deviceId + '",' +
                '"payload": ${payload},' +
                '"topic": "${topic}",' +
                '"emqxRuleId": "' + alarm.emqxRuleId + '",' +
                '"value": ' + alarm.value + ',' +
                '"condition": "' + alarm.condition + '",' +
                '"variable": "' + alarm.variable + '",' +
                '"variableName": "' + alarm.variableName + '",' +
                '"triggerTime": ' + alarm.triggerTime +
            '}';

            newRule.actions[0].params.payload_tmpl = payload_tmpl;
            
            var  resEMQXUpdate = await axios.put(apiUrl + '/' + alarm.emqxRuleId, newRule, emqxConfig);

            return alarm.toObject();
        }
    } catch (error) {
        console.log('ERROR createAlarm');
        console.log(error);

        return null;
    }
};

async function updateAlarmRuleStatus(emqxRuleId, status) {
    try {
        var rule = {
            enabled: status
        };

        var  resEMQX = await axios.put(apiUrl + '/' + emqxRuleId, rule, emqxConfig);

        if (resEMQX.status === 200 && resEMQX.data.data) {
            
            var alarm = await AlarmRule.updateOne(
                { emqxRuleId: emqxRuleId }, 
                { status: status });

            return alarm;
        }
    } catch (error) {
        console.log('ERROR updateAlarmRuleStatus');
        console.log(error);

        return null;
    }
};

async function deleteAlarmRule(userId, emqxRuleId) {
    try {
        var rule = await AlarmRule.findOne({ userId: userId, emqxRuleId: emqxRuleId });
        
        if (rule) {
            var res = await axios.delete(apiUrl + '/' + rule.emqxRuleId, emqxConfig);

            if (res.status === 200 && res.data.data) {
                var deleted = await AlarmRule.deleteOne({ userId: userId, emqxRuleId: emqxRuleId });

                return deleted;
            }
        }
        
        return null;
    } catch (error) {
        console.log('ERROR updateSaveRuleStatus');
        console.log(error);

        return null;
    }
};

function getConditionValue(variable, condition, value) {
    try {
        var opr1 = variable
        var opr2 = isNaN(value) ? '\'' + value + '\'' : value;
        switch (condition) {
            case 'eq':
                return `${opr1} = ${opr2}`;
            case 'gt':
                return `${opr1} > ${opr2}`;
            case 'get':
                return `${opr1} >= ${opr2}`;
            case 'lt':
                return `${opr1} < ${opr2}`;
            case 'let':
                return `${opr1} <= ${opr2}`;
            case 'neq':
                return `${opr1} != ${opr2}`;
            default:
                return 'is_int(0)';
        }
    } catch (error) {
        return 'is_int(0)';
    }
}

module.exports = router;