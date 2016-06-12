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

var clientId = process.env.FLICKR_WDC_API_KEY;
var clientSecret = process.env.FLICKR_WDC_API_SECRET;
var flickrRestURL = "https://api.flickr.com/services/rest/";

// Exchange a request token for an access token.
app.get('/accesstoken', function(req, res) {
    console.log("/accesstoken: " + req.url);

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
            console.log("got access token");

            // Done with this cookie. The client js uses it as a clue for when
            // to exchange the request token for an access token. We did that,
            // so clear the cookie.
            res.clearCookie("oauth_token_secret");
            res.write(body);
        } else {
            console.log(error);
        }
        res.end();
    });
 });

// Get the URL the client should use for sign-in UI. This URL requires a request
// token, so this function gets that first.
app.get('/oauthurl', function(req, res) {

    console.log("/oauthurl");

    var auth = oauth({
        consumer: {
            public: clientId,
            secret: clientSecret
        },
        signature_method: 'HMAC-SHA1'
    });

    var oauthCallbackUrl = process.env.FLICKR_WDC_HOSTPATH;
    if (req.query.port) {
        oauthCallbackUrl += ":" + req.query.port;
    }
    oauthCallbackUrl += "/flickr.html";
    console.log("oauthCallbackUrl: " + oauthCallbackUrl);

    var reqData = {
        url: 'https://www.flickr.com/services/oauth/request_token',
        method: 'GET',
        data: {
            oauth_callback: oauthCallbackUrl,
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
        } else {
            console.log(error);
        }
        res.end();
    });
});

// Call any arbitrary Flickr API function. Use the passThroughParams to pass
// params to Flickr.
app.get('/forward', function(req, res) {

    console.log("/forward " + req.query.passThroughParams.method);

    var auth = oauth({
        consumer: {
            public: clientId,
            secret: clientSecret
        },
        signature_method: 'HMAC-SHA1'
    });

    try {
        var token = JSON.parse(req.query.token);
    } catch(e) {
        console.log("error in forward " + req.query.passThroughParams.method + " " + e.message);
        res.end();
        return;
    }

    var apiParams = Object.assign({}, req.query.passThroughParams);
    apiParams.api_key = clientId;
    apiParams.format = "json";
    apiParams.nojsoncallback = "1";

    var reqData = {
        url: flickrRestURL,
        method: 'GET',
        data: apiParams,
    };

    var options = {
        url: reqData.url,
        method: reqData.method,
        qs: reqData.data,
        headers: auth.toHeader(auth.authorize(reqData, token))
    };

    request(options, function (error, response, body) {
        if (!error) {
            res.write(body);
        } else {
            res.write("{}");
            console.log(error);
            console.log(body);
        }
        res.end();
    });
});

// Validate that the server environment variable have been set.
function envVarsAreSet() {
    var valid = true;
    if (!process.env.FLICKR_WDC_API_KEY) {
        console.log("Environment variable FLICKR_WDC_API_KEY not set. Get this developer API key from Flickr.");
        valid = false;
    }
    if (!process.env.FLICKR_WDC_API_SECRET) {
        console.log("Environment variable FLICKR_WDC_API_SECRET not set. Get this developer API secret from Flickr.");
        valid = false;
    }
    if (!process.env.FLICKR_WDC_HOSTPATH) {
        console.log("Environment variable FLICKR_WDC_HOSTPATH not set. This is the base URL of this wdc-flickr-proxy server.");
        valid = false;
    }
    if (!process.env.PORT) {
        console.log("Environment variable PORT not set. This is the port for the server to listen on.");
        valid = false;
    }
    return valid;
}

if (envVarsAreSet()) {
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Server listening on port ' + app.get('port'));
    });
}

