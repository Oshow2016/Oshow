var express = require('express');

var path = require('path');
var flash    = require('connect-flash');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var passport = require('passport');
var LocalStrategy = require('passport-local');

var app = express();

app.locals.pretty = true;
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'/public')));
app.use('/jquery', express.static(path.join(__dirname + '/node_modules/jquery/dist/')));

// configuration ===============================================================
// connect to our database

require('.//models/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//required for passport
app.use(session({
	secret: 'mysecret',
	resave: true,
	saveUninitialized: true,
	cookie : { secure : false, maxAge : (2 * 60 * 60 * 1000) }
 } )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//routes
var clientMain = require('./routes/clientMain/app')(app);
app.use('/clientMain',clientMain);

var ownerMain = require('./routes/ownerMain/app')(app);
app.use('/ownerMain',ownerMain);

var ownerPage = require('./routes/ownerPage/app')(app);
app.use('/ownerPage',ownerPage);

var myPage = require('./routes/myPage/app')(app);
app.use('/myPage',myPage);

var authentication = require('./routes/authentication')(app, passport);
app.use('/',authentication);

var reservation = require('./routes/reservation/app')(app);
app.use('/reservation',reservation);

app.listen(3000, function(){
    console.log('Conneted 3000 port!');
});
