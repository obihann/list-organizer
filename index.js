var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'zbrlCUa6FLzVujrmwYIpGYtFA',
    consumerSecret: 'iRbfp6Q00hDv2jvRtWzzyAq5XklpaVfvEVJ9kcgr4Ip0OrU03m',
    callback: 'http://yoururl.tld/something'
});

var express = require('express');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function(req, res) {
        res.render('index', { title: 'Hello, World!' })
});
