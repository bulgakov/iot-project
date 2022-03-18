// Requires
const express = require("express");
const router = express.Router();
const axios = require('axios');
const { checkAuth } = require('../auth.js');
const { default: EmqxAuthRule } = require("../models/emqx_auth_rule.js");
//const { fcumsum } = require("d3");
//const { BIconExclamationSquareFill } = require("bootstrap-vue");

// imports

// Configs
const emqxConfig = {
    auth: {
        username: 'admin',
        password: process.env.EMQX_DEFAULT_APP_SECRET
    }
};

const url = process.env.EMQX_API_URL + '/resources';
const urlApi = process.env.API_URL;

global.saverResource = null;
global.alarmResource = null;

// Routes

// methods

// EMQX RESOURCE MANAGER
async function listResources() {

    try {
        var res = await axios.get(url, emqxConfig);

        if (res.status  == 200) {
            if (res.data.data.length == 0) {
                console.log('**** Creating emqx webhook resources ****');
                createResources();
            } else {
                res.data.data.forEach(resource => {
                    if (resource.description == 'alarm-webhook') {
                        global.alarmResource = resource
                        console.log('▼ ▼ ▼ ALARM RESOURCE FOUND ▼ ▼ ▼ ')
                        console.log(global.alarmResource)
                        console.log('▲ ▲ ▲ ALARM RESOURCE FOUND ▲ ▲ ▲ ')
                    }
                    
                    if (resource.description == 'saver-webhook') {
                        global.saverResource = resource;
                        console.log('▼ ▼ ▼ SAVER RESOURCE FOUND ▼ ▼ ▼ ')
                        console.log(global.saverResource)
                        console.log('▲ ▲ ▲ SAVER RESOURCE FOUND ▲ ▲ ▲ ')
                    }
                });
                
                if (!global.alarmResource || !global.saverResource) {
                    function resourcesNotFound() {
                        console.log('**** UNABLE TO CONFIG REQUIRED WEBHOOKS EQMX RESOURCES ****');
                        console.log(global.alarmResource);
                        console.log(global.saverResource);
                        console.log('CONFIG THE MISSING WEBHOOKS AND RESTART NODE');
                        setTimeout(() => {
                            resourcesNotFound();
                        }, 5000);
                    }
                    
                    resourcesNotFound();
                }
            }
        } else  {
            console.log('**** ERROR API EQMX ****');
        }
    } catch (err) {
        console.log('**** ERROR EQMXAPI listResources ****');
        console.log(err);
    }
};
    
async function createResources() {
    try {
        var dataSaver = {
            type: 'web_hook',
            config: {
                url: urlApi + '/webhooks/saver',
                headers: {
                    token: process.env.API_TOKEN
                },
                method: 'POST'
            },
            description: 'saver-webhook'
        };

        var dataAlarm = {
            type: 'web_hook',
            config: {
                url: urlApi + '/webhooks/alarm',
                headers: {
                    token: process.env.API_TOKEN
                },
                method: 'POST'
            },
            description: 'alarm-webhook'
        };

        var resSaver = await axios.post(url, dataSaver, emqxConfig);

        if (resSaver.status == 200 && resSaver.data.code == 0) {
            console.log('Saver resource created!');
        } else {
            console.log('Error creating Saver resource!');
            console.log(resSaver.data);
        }

        var resAlarm = await axios.post(url, dataAlarm, emqxConfig);

        if (resAlarm.status == 200 && resSaver.data.code == 0) {
            console.log('Alarm resource created!');
        } else {
            console.log('Error creating Alarm resource!');
            console.log(resAlarm.data);
        }

        setTimeout(() => {
            listResources();
        }, process.env.EMQX_RESOURCES_DELAY);
    } catch (error) {
        console.log('**** ERROR EQMXAPI createResources ****');
        console.log(err);
    }
};

setTimeout(() => {
    listResources();
}, process.env.EMQX_RESOURCES_DELAY);

global.check_mqtt_superuser = async function checkMqttSuperuser() {
    try {
        var superusers = await EmqxAuthRule.find({ type: 'admin' });

        if (superusers.length == 0) {
            await EmqxAuthRule.create({
                userId: process.env.EMQX_SUPERUSER_USER,
                username: process.env.EMQX_SUPERUSER_USER,
                password: process.env.EMQX_SUPERUSER_PASS,
                publish: [userId + '/#'],
                subscribe: [userId + '/#'],
                type: 'admin',
                createdTime: Date.now(),
                updatedTime: Date.now(),
            });
            console.log('Mqtt admin user created!');
        }
    } catch (error) {
        console.log('**** ERROR EQMXAPI checkMqttSuperuser ****');
        console.log(error);
    }
}

module.exports = router;