// Requires
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
//const colors = require("colors");
require('dotenv').config();

// Instances
const app = express();
const port = process.env.API_PORT;

// Configs
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.use(morgan('tiny'));

// Routes
app.use('/api/users', require('./routes/users.js'));
app.use('/api/devices', require('./routes/devices.js'));
app.use('/api/templates', require('./routes/templates.js'));
app.use('/api/alarms', require('./routes/alarms.js'));
app.use('/api/webhooks', require('./routes/webhooks.js'));
app.use('/api/emqxapi', require('./routes/emqxapi.js'));
app.use('/api/notifications', require('./routes/notifications.js'));

module.exports = app;

// Listeners
app.listen(port, () => {
    console.log('API server listening on port ' + port);
});

if (process.env.SSLREDIRECT == "true"){

    const app2 = express();
  
    app2.listen(3002, function(){
      console.log("Listening on port 3002 (for redirect to ssl)");
    });
    
    app2.all('*', function(req, res){
      console.log("NO SSL ACCESS ... REDIRECTING...");
      return res.redirect("https://" + req.headers["host"] + req.url);
    });
  }

// methods
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Database Connection
const dbHost = process.env.MONGO_HOST;
const dbPort = process.env.MONGO_PORT;
const dbInstance = process.env.MONGO_INITDB;
const dbUsername = process.env.MONGO_USER;
const dbPassword = process.env.MONGO_PASS;

var dbUri = 'mongodb://' + dbUsername + ':' + dbPassword + '@' + dbHost + ':' + dbPort + '/' + dbInstance;

const dbOptions = {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    authSource: 'admin'
};

mongoose.connect(dbUri, dbOptions).then(() => {
    console.log('\n');
    console.log('*******************************');
    console.log('Database connected!');
    console.log('*******************************');

    global.check_mqtt_superuser();
}, (err) => {
    console.log('\n');
    console.log('*******************************');
    console.log('Database connection error');
    console.log(err);
    console.log('*******************************');
});
