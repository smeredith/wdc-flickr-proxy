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
var redirectURL = config.HOSTPATH + ":" + app.get('port') + "/redirect";
var wdcURL = "./flickr.html";
var flickrRestURL = "https://api.flickr.com/services/rest/";

// This gets called by the Flickr signin page once authentication is complete.
app.get('/redirect', function(req, res) {
    console.log("in /redirect: " + req.url);

    // The request token comes as part of the redirect URL.
    // Exchange the request token for an access token.
    var oauth_token = req.query.oauth_token;
    var oauth_verifier = req.query.oauth_verifier;

    var auth = oauth({
        consumer: {
            public: clientId,
            secret: clientSecret
        },
        signature_method: 'HMAC-SHA1'
    });

    var token = {
        public: oauth_token,
        secret: req.cookies.oauth_token_secret
    };

    var reqData = {
        url: 'https://www.flickr.com/services/oauth/access_token',
        method: 'GET',
        data: {
            oauth_verifier: oauth_verifier
        }
    };

    var options = {
        url: reqData.url,
        method: reqData.method,
        headers: auth.toHeader(auth.authorize(reqData, token))
    };

    request(options, function (error, response, body) {
        if (!error) {
            console.log("got access token: " + body);
            var params = querystring.parse(body);

            // This oauth_token is the access token. It is used to sign all
            // future requests. Save in cookies because we'll be doing all the
            // signing here on the server (because we also need the client id and
            // client secret to sign and we don't want to send those to the client.)
            res.cookie('oauth_token', params.oauth_token);
            res.cookie('oauth_token_secret', params.oauth_token_secret);
            res.cookie('user_nsid', params.user_nsid);
            res.cookie('client_id', clientId);

            // Auth is complete. Return the WDC page.
            res.redirect(wdcURL);
        } else {
            console.log(error);
        }
    });
 });

app.get('/flickr', function(req, res) {

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
                oauth_callback: redirectURL
            }
        };

        var options = {
            url: reqData.url,
            method: reqData.method,
            headers: auth.toHeader(auth.authorize(reqData))
        };

        request(options, function (error, response, body) {
            if (!error) {
                console.log("getRequestToken() success: " + body);
                var params = querystring.parse(body);

                // We'll need this later to sign requests.
                res.cookie('oauth_token_secret', params.oauth_token_secret);

                var authUrl = 'https://www.flickr.com/services/oauth/authorize?perms=read&oauth_token=' + params.oauth_token;
                console.log(authUrl);
                res.redirect(authUrl);
            } else {
                console.log(error);
            }
        });
    }

    if (req.cookies.oauth_token) {
        console.log("Have access token.");
        res.redirect(wdcURL);
    } else {
        getRequestToken(res);
    }
});

// Signs the URL in the url query param and requests it, returning the response.
app.get('/flickr_people_getPhotos', function(req, res) {

    console.log("flickr_people_getPhotos");

    var auth = oauth({
        consumer: {
            public: clientId,
            secret: clientSecret
        },
        signature_method: 'HMAC-SHA1'
    });

    var token = {
        public: req.cookies.oauth_token,
        secret: req.cookies.oauth_token_secret
    };

    var reqData = {
        url: flickrRestURL,
        method: 'GET',
        data: {
            method: "flickr.people.getPhotos",
            api_key: req.cookies.client_id,
            user_id: req.cookies.user_nsid,
            extras: "tags,description,license,date_upload,date_taken,original_format,icon_server,last_update,geo,views,media,path_alias,url_sq,url_t,url_s,url_q,url_m,url_n,url_z,url_c,url_l,url_o",
            per_page: req.query.per_page,
            page: req.query.page,
            format: "json",
            nojsoncallback: "1",
        }
    };

    var options = {
        url: reqData.url,
        method: reqData.method,
        qs: reqData.data,
        headers: auth.toHeader(auth.authorize(reqData, token))
    };

    request(options, function (error, response, body) {
        if (!error) {
            console.log("got flickr.people.getPhotos response");
            res.send(body);
        } else {
            console.log(error);
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});


