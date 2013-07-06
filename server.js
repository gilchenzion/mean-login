var express = require('express');
var mongoose = require('mongoose');
var app = express();

app.configure(function() {
	
	app.set('views', __dirname + '/views');
  	app.set('view engine', 'jade');
  	app.set('view options', { layout: false });
  	app.use(express.bodyParser());
  	app.use(express.methodOverride());
	app.use(app.router);
	app.use("/public", express.static( __dirname + '/public'));
});

mongoose.connect('mongodb://localhost/login');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

	app.get('/', function(req, res){
		res.render('index', {});
	});

	app.listen(3000);
});

