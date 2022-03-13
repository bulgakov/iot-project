// Requires
const express = require("express");
const router = express.Router();
const { checkAuth } = require('../auth.js');

// imports
import Template from '../models/template.js'
import Device from '../models/device.js'

// Configs

// Routes

// methods
router.get('/', checkAuth, async (req, res) => {
    var resJson = {
        status: 'success'
    };

    try {
        var templates = await Template.find({ userId: req.userData._id });
        resJson.data = templates; 

        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.post('/', checkAuth, async (req, res) => {
    var resJson = {
        status: 'success',
    };

    try {

        var newTemplate = req.body;
        newTemplate.userId = req.userData._id;
        newTemplate.createdTime = Date.now();

        var template = await Template.create(newTemplate);
        
        resJson.data = template;
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
        var result = await Template.updateOne({ userId: req.userData._id, _id: req.body.templateId }, { name: req.body.name });

        if (result.modifiedCount == 0) {
            resJson.status = 'failed'
        }
        resJson.data = result.modifiedCount;
        res.json(resJson);
    } catch (error) {
        console.log(req.method + ' ' + req.baseUrl + ' ' + req.path + ' ERROR:');
        console.log(error);

        resJson.status = 'failed';
        resJson.error= error;
        res.status(500).json(resJson);
    }
});

router.delete('/', checkAuth, async (req, res) => {
    var resJson = {
        status: 'success'
    };

    try {
        var devices = await Device.find({ userId: req.userData._id, templateId: req.query.templateId });

        if (devices.length > 0) {
            resJson.status = 'failed';
            resJson.error= 'template in use';
            res.json(resJson);
        }

        var result = await Template.deleteOne({ userId: req.userData._id, _id: req.query.templateId });
        resJson.data = result.deletedCount; 

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