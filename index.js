var path = require ('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'zbrlCUa6FLzVujrmwYIpGYtFA',
    consumerSecret: 'iRbfp6Q00hDv2jvRtWzzyAq5XklpaVfvEVJ9kcgr4Ip0OrU03m',
    callback: 'http://yoururl.tld/something'
});

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function(req, res) {
    res.render('index', { title: 'Hello, World!' })
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Listening on ' + port);
});
