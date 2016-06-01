var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var path = require('path');
var config = require('./config.js');
var sys = require('util');

var app = express();

app.set('port', (process.env.PORT || config.PORT));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

var clientID = config.CLIENT_ID
var clientSecret = config.CLIENT_SECRET
var redirectURI = config.HOSTPATH + ":" + config.PORT + config.REDIRECT_PATH

app.get('/', function(req, res) {
  console.log("got here");
  res.redirect('/index.html');
});

http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
});

