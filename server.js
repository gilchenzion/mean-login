var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();


var mongourl = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/login'; 

mongoose.connect(mongourl);

var db = mongoose.connection;

//Comment

var userSchema = mongoose.Schema({
	email: String,
	pass: String
});

var pageSchema = mongoose.Schema({
	title: String,
	creator: String,
	date: {type: Date, default: Date.now },
	body: String
});

var User = db.model('User', userSchema);
var Page = db.model('Page', pageSchema);

passport.use(new LocalStrategy( {
		usernameField: 'email',
		passwordField: 'pass'
	}, 
	function(username, password, done) {
		process.nextTick(function() {
			User.findOne({ email: username }, function (err, user) {
      			if (err) { return done(err); }
     			if (!user) {
       				return done(null, false, { message: 'Incorrect username.' });
     			}
     			if(user.pass != password) {
     				return done(null, false, { message: 'Incorrect password.' });
     			}
      			return done(null, user);
    		});
		});
	}
));

passport.serializeUser(function(user, done) {
  	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  	User.findById(id, function(err, user) {
   		done(err, user);
  	});
});


db.on('error', console.error.bind(console, 'connection error:'));
	
app.configure(function() {
	app.set('views', __dirname + '/views');
  	app.set('view engine', 'jade');
  	app.set('view options', { layout: false });
  	app.use("/public", express.static( __dirname + '/public'));
  	
  	app.use(express.bodyParser());
  	app.use(express.methodOverride());
  	app.use(express.cookieParser());
  	app.use(express.session({ secret: 'keyboard cat' }));
  	app.use(passport.initialize());
  	app.use(passport.session());
	app.use(app.router);	
});

app.get('/home', function(req, res) {
	if(req.user) {
		res.render('home', {user : req.user});
	} else {
		res.redirect('/');
	}
});

app.get('/', function(req, res){
	if(req.user) {
		res.render('home', {user : req.user});
	} else {
		res.render('index', {});
	}
});

app.post('/login',
	passport.authenticate('local', {
		successRedirect: '/home',
		failureRedirect: '/'
	})
);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/home', function(req, res) {
	res.render('home', {});
});

app.get('/success/:id', function(req, res) {
	if(req.user)
	{
		Page.findOne({_id: req.params.id}, function(err, page) {
			if(err) {
				return handleError(err);
			} else {
				res.render('page', {page: page});
			}
		});
	} else {
		res.redirect('/');
	}
});

app.post('/new', function(req, res) {
	if(req.user) {
		var newPage = new Page({
			title: '',
			creator: req.user.email,
			body: '',
		});
		newPage.save(function(err) {
			if(err) {
				return handleError(err);
			} else {
				console.log('woooot');
				res.redirect('/success/' + newPage.id);
			}
		});
	} else {
		res.redirect('/');
	}
});

app.post('/register', function(req,res) {
	var newUser = new User(req.body);
	newUser.save(function(err) {
		if(err) {
			return handleError(err);
		} else {
			res.redirect('/');
		}
	});
});

app.listen(process.env.PORT || 3000);


