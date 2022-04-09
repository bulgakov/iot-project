// Requires
const express = require("express");
const router = express.Router();
const axios = require('axios');
const crypto = require("crypto");
const { checkAuth } = require('../auth.js');
const { format } = require('date-fns');

// imports
import Device from '../models/device.js';
import Template from '../models/template.js';
import SaveRule from '../models/emqx_save_rule.js';
import AlarmRule from '../models/emqx_alarm_rule.js';
import EmqxAuthRule from '../models/emqx_auth_rule.js';
import Data from '../models/data.js';

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
        var devices = await Device.find({ userId: req.userData._id });
        var templates = await getTemplates(req.userData._id);
        var rules = await getSaveRules(req.userData._id);
        var alarms = await getAlarmRules(req.userData._id);

        var deviceArray = JSON.parse(JSON.stringify(devices));

        deviceArray.forEach((device, index) => {
            deviceArray[index].saveRule = rules.filter(rule => rule.deviceId == device.deviceId)[0];
            deviceArray[index].template = templates.filter(template => template._id == device.templateId)[0];
            deviceArray[index].alarmRules = alarms.filter(alarm => alarm.deviceId == device.deviceId);
        });
        
        resJson.data = deviceArray;

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
        var newDevice = req.body;
        newDevice.userId = userId;
        newDevice.createdTime = Date.now();
        newDevice.password = makeid(10);
        newDevice.status = false;

        var device = await Device.create(newDevice);
        await createSaveRule(userId, newDevice.deviceId, false);
        await selectDevice(userId, newDevice.deviceId);

        resJson.data = device;
        res.json(resJson);
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
        var result = await selectDevice(req.userData._id, req.body.deviceId);
        if (!result) {
            resJson.status = "failed";
        }

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
        var rule = req.body.saveRule;

        await updateSaveRuleStatus(rule.emqxRuleId, rule.status);

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
        var userId = req.userData._id;
        var deviceId = req.query.deviceId;

        await deleteSaveRule(userId, deviceId);

        await deleteAlarmRules(userId, deviceId);

        await deleteDeviceCredentials(userId, deviceId);

        var result = await Device.deleteOne({ userId: userId, deviceId: deviceId });
        
        var devices = await Device.find({ userId: userId });

        if (devices.length >= 1) {
            var found = false;
            
            devices.forEach(device => {
                if (device.selected) {
                    found = true;
                }
            });

            if (!found) {
                await selectDevice(userId, devices[0].deviceId);
            }
        }
        
        resJson.data = result.deletedCount; 
        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.get('/data', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        var userId = req.userData._id;
        var deviceId = req.query.deviceId;
        var variable = req.query.variable;
        var timeAgo = req.query.timeAgo;

        var timeAgoMs = Date.now() - (timeAgo * 60 * 1000);

        var result = await Data.find({ userId: userId, deviceId: deviceId, variable: variable, 'createdTime': {$gt: timeAgoMs}}).sort({ 'createdTime': 1 });
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

router.get('/export/:deviceId/:variable?', checkAuth, async (req, res) => {
    var resJson = {
        status: "success"
    };

    try {
        var userId = req.userData._id;
        var deviceId = req.params.deviceId;
        var variable = req.params.variable;

        if (deviceId) {
            var data = [];
            if (variable && variable.toLowerCase() != 'all') {
                data = await Data.find({ userId: userId, deviceId: deviceId, variable: variable}).sort({ 'createdTime': 1 });
            } else {
                data = await Data.find({ userId: userId, deviceId: deviceId }).sort({ 'createdTime': 1 });
            }

            var device = await Device.findOne({ deviceId: deviceId });
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

            var result = [];

            data.forEach(d => {
                var variableObj = variables.filter(v => v.variable == d.variable);
                result.push({
                    deviceId: d.deviceId,
                    deviceName: device.name,
                    variable: d.variable,
                    variableName: variableObj.length == 1 ? variableObj[0].variableName : null,
                    variableType: variableObj.length == 1 ? variableObj[0].variableType : null,
                    value: d.value,
                    createdTime: format(d.createdTime, 'yyyy-MM-dd HH:mm:ss')
                });
            });

            resJson.data = result; 
            res.json(resJson);
        } else {
            resJson.status = "failed";
            resJson.error= '';
            res.status(404).json(resJson);
        }
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = "failed";
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

// functions
async function selectDevice(userId, deviceId) {
    try {
        var resultDeselect = await Device.updateMany({ userId: userId }, { selected: false });
        var resultSelect = await Device.updateOne({ userId: userId, deviceId: deviceId }, { selected: true });

        return true;
    } catch (error) {
        return false;
    }
}

async function getTemplates(userId) {
    try {
        var templates = await Template.find({ userId: userId });
        return templates; 
    } catch (error) {
        console.log('ERROR getTemplates');
        console.log(error);

        return null;
    }
}

async function getAlarmRules(userId) {
    try {
        var rules = await AlarmRule.find({ userId: userId });
        return rules; 
    } catch (error) {
        console.log('ERROR getAlarmRules');
        console.log(error);

        return null;
    }
}

async function getSaveRules(userId) {
    try {
        var rules = await SaveRule.find({ userId: userId });
        return rules; 
    } catch (error) {
        console.log('ERROR getSaveRules');
        console.log(error);

        return null;
    }
}

async function createSaveRule(userId, deviceId, status) {
    try {
        var topic = userId + '/' + deviceId + '/+/sdata';
        var newRule = {
            rawsql: 'SELECT topic, payload FROM "' + topic + '" WHERE payload.save = 1',
            actions: [
                {
                    name: 'data_to_webserver',
                    params: {
                        $resource: global.saverResource.id,
                        payload_tmpl:
                            '{ ' +
                                '"userId": "' + userId + '",' +
                                '"payload": ${payload},' +
                                '"topic": "${topic}"' +
                            '}'
                    }
                }
            ],
            description: 'SAVER-RULE',
            enabled: status
        };

        var  res = await axios.post(apiUrl, newRule, emqxConfig);

        if (res.status === 200 && res.data.data) {
            var rule = await SaveRule.create({
                userId: userId,
                deviceId: deviceId,
                emqxRuleId: res.data.data.id,
                status: status
            });

            return rule;
        }
        
        return null;
    } catch (error) {
        console.log('ERROR createSaveRule');
        console.log(error);

        return null;
    }
}

async function updateSaveRuleStatus(emqxRuleId, status) {
    try {
        var rule = {
            enabled: status
        };

        var res = await axios.put(apiUrl + '/' + emqxRuleId, rule, emqxConfig);

        if (res.status === 200 && res.data.data) {
            var updated = await SaveRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });

            return updated;
        }
        
        return null;
    } catch (error) {
        console.log('ERROR updateSaveRuleStatus');
        console.log(error);

        return null;
    }
}

async function deleteSaveRule(userId, deviceId) {
    try {
        var rule = await SaveRule.findOne({ userId: userId, deviceId: deviceId });
        
        if (rule) {
            var res = await axios.delete(apiUrl + '/' + rule.emqxRuleId, emqxConfig);

            if (res.status === 200 && res.data) {
                var deleted = await SaveRule.deleteOne({ userId: userId, deviceId: deviceId });

                return deleted;
            }
        }
        
        return true;
    } catch (error) {
        console.log('ERROR deleteSaveRule');
        console.log(error);

        return false;
    }
}

async function deleteAlarmRules(userId, deviceId) {
    try {
        var rules = await AlarmRule.find({ userId: userId, deviceId: deviceId });
        
        if (rules.length > 0) {
            asyncForEach(rules, async rule => {
                await axios.delete(apiUrl + '/' + rule.emqxRuleId, emqxConfig);
            });
        }
        
        await AlarmRule.deleteMany({ userId: userId, deviceId: deviceId });

        return true;
    } catch (error) {
        console.log('ERROR deleteAlarmRules');
        console.log(error);

        return false;
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);        
    }
}

async function deleteDeviceCredentials(userId, deviceId) {
    try {
        
        await EmqxAuthRule.deleteMany({
            type: 'device',
            userId: userId,
            deviceId: deviceId
        });

        return true;
    } catch (error) {
        console.log('ERROR deleteDeviceCredentials');
        console.log(error);

        return false;
    }
}

function makeid(length) {
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

module.exports = router;