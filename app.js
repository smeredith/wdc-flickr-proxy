var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var oauth = require('oauth-1.0a');
var path = require('path');
var config = require('./config-private.js');    // Not checked in.
var sys = require('util');

var app = express();

app.set('port', (process.env.PORT || config.PORT));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

var clientId = config.CLIENT_ID;
var clientSecret = config.CLIENT_SECRET;
var redirectURI = config.HOSTPATH + ":" + app.get('port') + "/redirect";

app.get('/redirect', function(req, res) {
    console.log("in /redirect");
});

app.get('/d', function(req, res) {

    function getRequestToken(res) {
        console.log("in getRequestToken()");

        var auth = oauth({
            consumer: {
                public: clientId,
                secret: clientSecret
            },
            signature_method: 'HMAC-SHA1'
        });

        var reqData = {
            url: 'https://www.flickr.com/services/oauth/request_token',
            method: 'GET',
            data: {
                oauth_callback: redirectURI
            }
        };

        var options = {
            url: reqData.url,
            method: reqData.method,
            form: auth.authorize(reqData),
            headers: auth.toHeader(auth.authorize(reqData))
        };

        request(options, function (error, response, body) {
            if (!error) {
                console.log("getRequestToken() success: " + body);
                var params = querystring.parse(body);

                // We'll need this later to sign requests.
                res.cookie('oauth_token_secret', params.oauth_token_secret);

                var redirectUrl = 'https://www.flickr.com/services/oauth/authorize?perms=read&oauth_token=' + params.oauth_token;
                console.log(redirectUrl);
                res.redirect(redirectUrl);
            } else {
                console.log(error);
            }
        });
    }

    if (req.accessToken) {
        //res.redirect('/index.html');
    } else {
        getRequestToken(res);
    }
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});

