var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var oauth = require('oauth-1.0a');
var path = require('path');
var sys = require('util');

var app = express();

app.set('port', process.env.PORT);
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

var pageSize = process.env.FLICKR_WDC_PAGESIZE;
var clientId = process.env.FLICKR_WDC_API_KEY;
var clientSecret = process.env.FLICKR_WDC_API_SECRET;
var redirectURL = process.env.FLICKR_WDC_HOSTPATH + "/flickr.html";
var wdcURL = "public/flickr.html";
var flickrRestURL = "https://api.flickr.com/services/rest/";

app.get('/accesstoken', function(req, res) {
    console.log("in /accesstoken: " + req.url);

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

            res.write(body);
            res.end();
        } else {
            console.log(error);
        }
    });
 });

// Get the URL the client should use for sign-in UI. This URL requires a request
// token, so this function gets that first.
app.get('/oauthurl', function(req, res) {

    console.log("in /oauthurl");

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
            console.log("got request token: " + body);
            var params = querystring.parse(body);

            // We'll need this later to exchange the request token for the
            // access token.
            res.cookie('oauth_token_secret', params.oauth_token_secret);

            var authUrl = 'https://www.flickr.com/services/oauth/authorize?perms=read&oauth_token=' + params.oauth_token;
            res.write(authUrl);
            res.end();
        } else {
            console.log(error);
        }
    });
});

// Signs the URL in the url query param and requests it, returning the response.
app.get('/flickr_people_getphotos', function(req, res) {

    console.log("flickr_people_getphotos");

    var auth = oauth({
        consumer: {
            public: clientId,
            secret: clientSecret
        },
        signature_method: 'HMAC-SHA1'
    });

    var token = JSON.parse(req.query.token);

    var reqData = {
        url: flickrRestURL,
        method: 'GET',
        data: {
            method: "flickr.people.getPhotos",
            api_key: clientId,
            user_id: req.query.user_id,
            extras: "tags,description,license,date_upload,date_taken,original_format,icon_server,last_update,geo,views,media,path_alias,url_sq,url_t,url_s,url_q,url_m,url_n,url_z,url_c,url_l,url_o",
            per_page: pageSize,
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

    console.log("Getting page " + req.query.page + " for user_id: " + options.qs.user_id);

    request(options, function (error, response, body) {
        if (!error) {
            console.log("got flickr.people.getPhotos response");
            res.write(body);
            res.end();
        } else {
            console.log(error);
        }
    });
});

app.get('/istokenvalid', function(req, res) {

    console.log("istokenvalid");

    var auth = oauth({
        consumer: {
            public: clientId,
            secret: clientSecret
        },
        signature_method: 'HMAC-SHA1'
    });

    var token = JSON.parse(req.query.token);

    var reqData = {
        url: flickrRestURL,
        method: 'GET',
        data: {
            method: "flickr.test.login",
            api_key: clientId,
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
            console.log(body);
            resJson = JSON.parse(body);
            res.write(resJson.stat);
            res.end();
        } else {
            console.log(error);
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});


