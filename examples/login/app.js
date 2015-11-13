var express = require('express'),
	passport = require('passport'),
	util = require('util'),
	InBankStrategy = require('../../').Strategy,
	morgan = require('morgan'),
	session = require('express-session'),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	methodOverride = require('method-override');

var env = process.env.NODE_ENV || 'development';
// var INBANK_APP_ID = "--insert-inbank-app-id-here--";
// var INBANK_APP_SECRET = "--insert-inbank-app-secret-here--";
var INBANK_APP_ID = "43j09dd940i1";
var INBANK_APP_SECRET = "dd3s4d";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete InBank profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


// Use the InBankStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and InBank
//   profile), and invoke a callback with a user object.
passport.use(new InBankStrategy({
		clientID: INBANK_APP_ID,
		clientSecret: INBANK_APP_SECRET,
		callbackURL: "http://localhost:3000/auth/inbank/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		console.log('accessToken: ' + accessToken);
		console.log('refreshToken: ' + refreshToken);
		console.log('profile: ' + JSON.stringify(profile, null, 4));
		// asynchronous verification, for effect...
		process.nextTick(function () {
			
			// To keep the example simple, the user's InBank profile is returned to
			// represent the logged-in user.  In a typical application, you would want
			// to associate the InBank account with a user record in your database,
			// and return that user instead.
			return done(null, profile);
		});
	}
));




var app = express();

// Don't log during tests
// Logging middleware
if (env !== 'test') {
	morgan('combined', {
		skip: function (req, res) { return res.statusCode < 400 }
	});
}

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		// look in urlencoded POST bodies and delete it
		var method = req.body._method;
		delete req.body._method;
		return method;
	}
}));
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'secret'
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
	res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
	res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
	res.render('login', { user: req.user });
});

// GET /auth/inbank
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in InBank authentication will involve
//   redirecting the user to in-bank.ir.  After authorization, InBank will
//   redirect the user back to this application at /auth/inbank/callback
app.get('/auth/inbank',
	passport.authenticate('inbank'),
	function(req, res){
		// The request will be redirected to InBank for authentication, so this
		// function will not be called.
	});

// GET /auth/inbank/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/inbank/callback', 
	passport.authenticate('inbank', { failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
	});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
}
