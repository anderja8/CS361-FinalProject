/*****************************************************************
 * Name: GROUP 9
 * Date: November 27, 2019
 * Project: LA Street Safety App
 ****************************************************************/

let express = require('express');
let mysql = require('./dbcon.js');

let app = express();
let handlebars = require('express-handlebars').create({defaultLayout:'home'});
let session = require('express-session');
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 52222);

app.use(session({
    secret: 'cookieSecret',
    resave: true,
    saveUninitialized: true
}));

//Renders home page
app.get('/', function(req, res, next) {
    var context = {};
    res.render('home', context);
});

//Renders account creation page
app.get('/createAccount', function(req, res, next) {
    var context = {};
    context.layout = 'account';
    res.render('account', context);
});

//Renders login page
app.get('/login', function(req, res, next) {
    var context = {};
    context.layout = 'login';
    res.render('login', context);
});

//Renders incident report submission page
app.get('/incidentReport/submit', function(req, res, next) {
    var context = {};
    if(!req.session.userid) {
        console.log("No user has been logged in");
        context.userid = null;
    }
    else {
        context.userid = req.session.userid;
    }
    context.layout = 'submitIncident';
    res.render('submitIncident', context);
});

//Checks login credentials
app.get('/login/:username/:password', function(req, res, next) {
    let context = {};
    let callbackCount = 0;
    getUserID(res, req, context, req.params.username, req.params.password, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.redirect('/');
        }
    }
});

//Posts an incident to the database
app.post('/save-incident', function(req, res, next) {
    //Create the query string
    var qryString = "insert into incidentReports" + 
        " (userid, incidentDate, title, description, location, incidentType, involvement, mode1, isAnonymous, receivesUpdates)" +
        " values (?,?,?,?,?,?,?,?,?,?)";
	
    console.log(qryString);
    console.log(req.body);
	
    //Submit the query
    //For now, I'm defaulting the userid to 1 for everybody
    mysql.pool.query(qryString,
            [req.body.userid, req.body.date, req.body.title, req.body.description, req.body.location, req.body.type, req.body.involvement,
             req.body.mode, req.body.isAnonymous, req.body.receivesUpdates], function(err, result){
        if (err) {
            console.log('Error inserting incident to db');
            console.log(err);
            res.end();
        }
        else {
            console.log('Incident created');
            res.end();
        }
    });
});

//Gets the user id if the username and password are correct
function getUserID(res, req, context, username, password, complete) {
    mysql.pool.query("SELECT id FROM users WHERE username = ? AND password = ?", [username, password], function(error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
            console.log(error);
        }
        else if (results.length > 0) {
            req.session.userid = results[0].id;
            console.log(req.session.userid);
        }
        complete();
    });
}

//Renders 404 error page
app.use(function(req, res) {
    let context = {};
    context.layout = 'blank';
    res.status(404);
    res.render('404', context);
});

//Renders 500 error page
app.use(function(err, req, res, next) {
    let context = {};
    context.layout = 'blank';
    console.error(err.stack);
    res.status(500);
    res.render('500', context);
});

//Begins listening for connections
app.listen(app.get('port'), function() {
    console.log('Web server has begun running on port ' + app.get('port') + '; press Ctrl+C to terminate.');
});
