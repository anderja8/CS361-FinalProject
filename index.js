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
app.set('port', 52223);

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

app.get('/viewUserReports',function(req,res){
    if(!req.session.userid){
        var context = {};
        context.layout = 'login';
        res.render('login', context);
    }
    else{
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        today = yyyy + '/' + mm + '/' + dd;
        if(req.query.searchByDateEnd == ""){
            req.query.searchByDateEnd = today;
        }
        if(req.query.searchByDateBegin == ""){
            req.query.searchByDateBegin = '0000/00/00';
        }
        if (req.query.searchByType != null && req.query.searchByType != "all" && req.query.searchByDateBegin != null && req.query.searchByDateBegin != null) {
            console.log("filtering by type");
            mysql.pool.query("SELECT * FROM incidentReports WHERE incidentType = ? AND userid = ? AND incidentDate BETWEEN ? and ? ORDER BY incidentDate DESC", [req.query.searchByType, req.session.userid, req.query.searchByDateBegin, req.query.searchByDateEnd], function (err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                res.send(rows);
           });
        }
        else if (req.query.searchByType != null && req.query.searchByType == "all" && req.query.searchByDateBegin != null && req.query.searchByDateBegin != null) {
            console.log("filtering by date");
            mysql.pool.query("SELECT * FROM incidentReports WHERE userid = ? AND incidentDate BETWEEN ? and ? ORDER BY incidentDate DESC", [req.session.userid, req.query.searchByDateBegin, req.query.searchByDateEnd], function (err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                res.send(rows);
           });
        }
        else {
            var context = {};
            mysql.pool.query('SELECT * FROM incidentReports where userid = ? ORDER BY incidentDate DESC',[req.session.userid],function(err,reports,fields){
                if(err){
                    console.log("error showing user reports")
                    res.end();
                    return;
                }
                console.log("showing user reports")
                var params = [];
                for(report in reports){
                    var newRow ={
                        'incidentDate': reports[report].incidentDate,
                        'title': reports[report].title,
                        'description': reports[report].description,
                        'location': reports[report].location,
                        'incidentType': reports[report].incidentType,
                        'id':reports[report].id,
                        'currPage':'viewUserReports'
                    };
                    params.push(newRow);
                }
                context.layout = 'viewUserReports';
                context.reports = params;
                context.user = req.session.name;
                console.log(context)
                res.render('viewUserReports', context);
            });
        }
    }
    
});

app.get('/viewUserReports/:id/:prevPage',function(req,res){
    var context = {};
    if(!req.session.userid){
        context.layout = 'login';
        res.render('login', context);
    }
    else{
        mysql.pool.query('SELECT * FROM incidentReports where id =? ORDER BY incidentDate DESC',[req.params.id],function(err,reports,fields){
            if(err){
                console.log("error showing user reports, prevPage")
                res.end();
                return;
            }
            console.log("tried showing user reports, prevPage")
            var params = [];
            for(report in reports){
                var newRow ={
                    'incidentDate': reports[report].incidentDate,
                    'title': reports[report].title,
                    'description': reports[report].description,
                    'location': reports[report].location,
                    'incidentType': reports[report].incidentType,
                    'id':reports[report].id
                };
                params.push(newRow);
            }
            context.reports = params;
            context.prevPage = req.params.prevPage;
            console.log(context)
            res.render('report', context);
        });
    }
    
});

// now updated to seach by accident type
app.get('/viewAllReports', function(req,res){
    if(!req.session.userid){
        var context = {};
        context.layout = 'login';
        res.render('login', context);
    }
    else{
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        today = yyyy + '/' + mm + '/' + dd;
        if(req.query.searchByDateEndAll == ""){
            req.query.searchByDateEndAll = today;
        }
        if(req.query.searchByDateBeginAll == ""){
            req.query.searchByDateBeginAll = '0000/00/00';
        }
        if (req.query.searchByTypeAll != null && req.query.searchByTypeAll != "all" && req.query.searchByDateBeginAll != null && req.query.searchByDateEndAll != null ) {
            var qryString = "SELECT ir.id, ir.userid, ir.incidentDate, ir.title, ir.description, ir.location, ir.incidentType, ir.involvement, ";
            qryString += "ir.mode1, ir.mode2, ir.mode3, ir.mode4, ir.isAnonymous, ir.receivesUpdates, ";
            qryString += "concat(u.firstName, \" \", u.lastName) as fullName ";
            qryString += "from  incidentReports ir left join users u on ir.userid = u.id WHERE ir.incidentType = ? and ir.incidentDate BETWEEN ? and ? ORDER BY ir.incidentDate DESC";
            // console.log("filtered by just type: ");
            console.log("type: " + [req.query.searchByTypeAll]);
            console.log("date: "+ [req.query.searchByDateBeginAll] +" - "+ [req.query.searchByDateEndAll]);
            mysql.pool.query(qryString, [req.query.searchByTypeAll, req.query.searchByDateBeginAll, req.query.searchByDateEndAll], function(err,rows,fields){
                if (err) {
                    throw(err);
                    return;
                }
                res.send(rows);
           });
        }

        else if (req.query.searchByTypeAll != null && req.query.searchByTypeAll == "all" && req.query.searchByDateBeginAll != null && req.query.searchByDateEndAll != null) {
            var qryString = "SELECT ir.id, ir.userid, ir.incidentDate, ir.title, ir.description, ir.location, ir.incidentType, ir.involvement, ";
            qryString += "ir.mode1, ir.mode2, ir.mode3, ir.mode4, ir.isAnonymous, ir.receivesUpdates, ";
            qryString += "concat(u.firstName, \" \", u.lastName) as fullName ";
            qryString += "from  incidentReports ir left join users u on ir.userid = u.id WHERE ir.incidentDate BETWEEN ? and ? ORDER BY ir.incidentDate DESC";
            console.log("filtered by just date");
            console.log("date: "+ [req.query.searchByDateBeginAll] +" - "+ [req.query.searchByDateEndAll]);
            mysql.pool.query(qryString, [req.query.searchByDateBeginAll, req.query.searchByDateEndAll], function(err,rows,fields){
                if (err) {
                    throw(err);
                    return;
                }
                res.send(rows);
           });
        }
        else {
            var context = {};
            var qryString = "SELECT ir.id, ir.userid, ir.incidentDate, ir.title, ir.description, ir.location, ir.incidentType, ir.involvement, ";
            qryString += "ir.mode1, ir.mode2, ir.mode3, ir.mode4, ir.isAnonymous, ir.receivesUpdates, ";
            qryString += "concat(u.firstName, \" \", u.lastName) as fullName ";
            qryString += "from  incidentReports ir left join users u on ir.userid = u.id ORDER BY ir.incidentDate DESC";
    
            mysql.pool.query(qryString, function(err,reports,fields){
                if(err){
                    console.log("error showing all reports");
                    res.end();
                    return;
                }
            console.log("intitial showing all reports");
            // console.log("type: " + [req.query.searchByTypeAll] + " and date: " + [req.query.searchByDateBeginAll] +" - "+ [req.query.req.query.searchByDateEndAll])

            var params = []
            for (report in reports){
                var newRow ={
                    'incidentDate': reports[report].incidentDate,
                    'title': reports[report].title,
                    'description': reports[report].description,
                    'location': reports[report].location,
                    'incidentType': reports[report].incidentType,
                    'id':reports[report].id,
                    'fullName':reports[report].fullName,
                    'currPage':'viewAllReports'
                };
                params.push(newRow);
            }
            context.layout = 'viewAllReports';
            context.reports = params;
            res.render('viewAllReports',context);
           });
        }
    }
    
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
