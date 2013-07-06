var express = require('express');
var app = express();
var mongoose = require('mongoose');

app.configure(function() {
	app.use(express.bodyParser());
	app.set('views', __dirname + '/views');
  	app.set('view engine', 'jade');
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

