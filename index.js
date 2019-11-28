/*****************************************************************
 * Name: GROUP 9
 * Date: November 27, 2019
 * Project: LA Street Safety App
 ****************************************************************/

let express = require('express');
let mysql = require('./dbcon.js');

let app = express();
let handlebars = require('express-handlebars').create({defaultLayout:'home'});
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 52222);

//Renders home page
app.get('/', function(req, res, next) {
    res.render('home');
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
    context.layout = 'submitIncident';
    res.render('submitIncident', context);
});

app.post('/save-incident', function(req, res, next) {
	//Create the query string
	var qryString = "insert into incidentReports" + 
		"(userid, incidentDate, title, description, location, incidentType, involvement, mode1, isAnonymous, receivesUpdates)" +
		"values (?,?,?,?,?,?,?,?,?,?)";
	
	console.log(qryString);
	console.log(req.body);
	
	//Submit the query
	//For now, I'm defaulting the userid to 1 for everybody
	mysql.pool.query(qryString,
			[1, req.body.date, req.body.title, req.body.description, req.body.location, req.body.type, req.body.involvement,
			req.body.mode, req.body.mode, req.body.isAnonymous, req.body.recievesUpdates], function(err, result){
		if (err) {
			console.log('Error inserting incident to db');
			//res.send();
		}
		else {
			console.log('Incident created');
			res.send();
		}
	});
});

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
