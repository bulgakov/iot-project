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
        if (!Array.isArray(req.body.actions)) {
            resJson.status = "failed";
            resJson.error = 'Actions array is required'
            res.status(500).json(resJson);
        }

        if (Array.isArray(req.body.actions) && req.body.actions.length == 0) {
            resJson.status = "failed";
            resJson.error = 'Actions array is required'
            res.status(500).json(resJson);
        }

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
        var actions = [];

        //  Actions => EMQX Actions
        //  notify   -> data_to_webserver
        //  actuator -> republish
        //  nothing  -> do_nothing
        //  everything else -> do_nothing
        newAlarm.actions.forEach(action => {
            switch (action.type) {
                case 'notify':
                    actions.push({
                        name: 'data_to_webserver',
                        params: {
                            $resource: global.alarmResource.id,
                            payload_tmpl:
                                '{ ' +
                                    '"userId": "' + newAlarm.userId + '",' +
                                    '"payload": ${payload},' +
                                    '"topic": "${topic}"' +
                                '}'
                        }
                    });
                    break;
                case 'actuator':
                    // actuator topic
                    var actuatorTopic = 
                        newAlarm.userId + '/' + 
                        newAlarm.deviceId + '/' + 
                        action.variable + '/actdata';
                    
                    actions.push({
                        name: 'republish',
                        params: {
                            target_topic: actuatorTopic,
                            target_qos: 0,
                            payload_tmpl:
                                '{ ' +
                                    '"userId": "' + newAlarm.userId + '",' +
                                    '"payload": ${payload},' +
                                    '"topic": "${topic}"' +
                                '}'
                        }
                    });
                    break;         
                default: // in case try to tamper create action to nothing 
                    actions.push({
                        name: 'do_nothing',
                        params: {}
                    });
                    break;
            }
        });

        var newRule = {
            rawsql: rawsql,
            actions: actions,
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
                actions: newAlarm.actions,
                status: newAlarm.status,
                counter: 0,
                createdTime: Date.now()
            });

            // Update actions template
            // WARNING - Doesnt work for mutiple actions of actuator
            for (let i = 0; i < newRule.actions.length; i++) {
                switch (newRule.actions[i].name) {
                    case 'data_to_webserver':
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
                        newRule.actions[i].params.payload_tmpl = payload_tmpl;
                        break;
                    case 'republish':
                        // Retrieve Value from action
                        var actuatorTopic = newRule.actions[i].params.target_topic;
                        var actuatorId = actuatorTopic.split('/')[2];
                        var action = newAlarm.actions.filter(t => t.type == 'actuator' && t.variable == actuatorId)[0];
                        var payload_tmpl =
                        '{ ' +
                            '"payload": ${payload},' +
                            '"topic": "${topic}",' +
                            '"emqxRuleId": "' + alarm.emqxRuleId + '",' +
                            '"value": ' + action.value + ',' +
                        '}';
                        newRule.actions[i].params.payload_tmpl = payload_tmpl;
                        break;
                    default:
                        break;
                }
            }
            
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
            console.log(res.data);
            if (res.status === 200 && res.data) {
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