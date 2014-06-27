var path = require ('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'zbrlCUa6FLzVujrmwYIpGYtFA',
    consumerSecret: 'iRbfp6Q00hDv2jvRtWzzyAq5XklpaVfvEVJ9kcgr4Ip0OrU03m',
    callback: 'http://list-organizer.herokuapp.com/callback'
});
var redis = require('redis'), 
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var title = 'Twitter List Tool';

app.get('/', function(req, res) {
    res.render('index', { title: title, message: "Easily manager your twitter lists and organize who you follow."})
});

app.get('/signin', function(req, res) {
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
        if (error) {
            res.render('index', { title: title, message: JSON.stringify(error)})
        } else {
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken);
        }
    });
});

app.get('/callback', function(req, res) {
    res.render('index', { title: 'Callback', message: 'Your being called back'})
    twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
        if (error) {
            res.render('index', { title: 'Get Request Token', message: JSON.stringify(error)})
        } else {
            res.render('index', { title: 'Done', message: 'Look what we did'})
        }
    });
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Listening on ' + port);
});
