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
let passport = require('passport');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 52222);

app.use(session({
    secret: 'cookieSecret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Renders home page
app.get('/', function(req, res, next) {
    var context = {};
    if(!req.session.userid) {
        context.userMessage = "Note: You are logged out. Please log in to submit an incident.";
        context.userid = null;
    }
    else {
        context.userMessage = "Current User: " + req.session.name;
        context.userid = req.session.userid;
    }  
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
        res.redirect('/login');
    }
    else {
        context.userid = req.session.userid;
        context.layout = 'submitIncident';
        res.render('submitIncident', context);
    }  
});

//Checks login credentials
app.get('/login/:username/:password', function(req, res, next) {
    let context = {};
    let callbackCount = 0;
    getUserID(res, req, context, req.params.username, req.params.password, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 1) {
            res.redirect('/landing');
        }
    }
                
});

//Posts an incident to the database
app.post('/save-incident', function(req, res, next) {
    //Create the query string
    var qryString = "insert into incidentReports" + 
        " (userid, incidentDate, title, description, location, incidentType, involvement, mode1, mode2, mode3, mode4, isAnonymous, receivesUpdates)" +
        " values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
	
    console.log(qryString);
    console.log(req.body);
	
    //Submit the query
    context = {};
    context = req.body;
    nullify(context);
    mysql.pool.query(qryString,
            [context.userid, context.date, context.title, context.description, context.location, context.type, context.involvement,
             context.mode1, context.mode2, context.mode3, context.mode4, context.isAnonymous, context.receivesUpdates], function(err, result){
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

// account creation submission
app.post('/save-account', function(req, res, next) 
{
    console.log(req.body.firstName);
    console.log(req.body.lastName);
    console.log(req.body.email);
    console.log(req.body.username);
    console.log(req.body.password);

        var sql = "INSERT INTO users (firstName, lastName, email, username, password) VALUES (?,?,?,?,?)";
        var inserts = [req.body.firstName, req.body.lastName, req.body.email, req.body.username, req.body.password];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log('/login/'+req.body.username+'/'+req.body.password);
                res.redirect('login/'+req.body.username+'/'+req.body.password);
            }
        });
});

app.get('/landing', function(req, res, next) {
    var context = {};
    context.layout = 'landing';
    if(!req.session.userid) {
        context.message = "Your login was unsuccessful. Please check your username and password.";
        context.userid = null;
        res.render('landing', context)
    }
    else {
        context.message = "You are now logged in. Current User: " + req.session.name;
        context.userid = req.session.userid;
        res.render('landing', context);
    }  
});

// Logout form
app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    var context = {};
    context.layout = 'logout';
    res.render('logout', context);
});

//Gets the user id if the username and password are correct
function getUserID(res, req, context, username, password, complete) {
    mysql.pool.query("SELECT id, firstName, lastName FROM users WHERE username = ? AND password = ?", [username, password], function(error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
            console.log(error);
        }
        else if (results.length > 0) {
            req.session.userid = results[0].id;
            req.session.name = results[0].firstName + " " + results[0].lastName;
            console.log(req.session.userid);
            console.log(req.session.name);
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

//Helper function to convert empty strings to NULL
function nullify(array) {
    for (key in array) {
        if (array[key] == "") {
            array[key] = null;
        }
    }
};

passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    //User.findById(id, function (err, user) {
        done(err, user);
    });
//});
