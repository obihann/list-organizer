var _ = require('lodash');
var async = require('async');
var path = require ('path');
var bodyParser = require('body-parser');
var connect = require('connect');
var express = require('express');
var session = require('express-session');

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'zbrlCUa6FLzVujrmwYIpGYtFA',
    consumerSecret: 'iRbfp6Q00hDv2jvRtWzzyAq5XklpaVfvEVJ9kcgr4Ip0OrU03m',
    callback: 'http://localhost:3000/callback'
    //callback: 'http://list-organizer.herokuapp.com/callback'
});

var app = express();

app.use(session({secret: 'keyboard cat'}));
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
            req.session.requestToken = requestToken;
            req.session.requestTokenSecret = requestToken;
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken);
        }
    });
});

app.get('/callback', function(req, res) {
    twitter.getAccessToken(req.session.requestToken, req.session.requestTokenSecret, req.query.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
        if (error) {
            res.render('index', { title: title, message: JSON.stringify(error)})
        } else {
            req.session.accessToken = accessToken;
            req.session.accessTokenSecret = accessTokenSecret;

            res.redirect('/list');
        }
    });
});

app.get('/list', function(req, res) {
    if (typeof req.session.accessToken === 'undefined' || typeof req.session.accessTokenSecret == 'undefined') {
        res.redirect('/');
    } else {
        async.parallel([
            function(callback) {
                twitter.friends('list', {count: 200}, req.session.accessToken, req.session.accessTokenSecret, function(error, data, response) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, data.users);
                    }
                });
            },
            function(callback) {
                async.waterfall([
                    function(callback) {
                        twitter.lists('list', {}, req.session.accessToken, req.session.accessTokenSecret, function(error, data, response) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null, data);
                            }
                        });
                    },
                    function(lists, callback) {
                        var users = new Array();
                        async.each(lists, function(list, callback) {
                            twitter.lists('members', {list_id: list.id}, req.session.accessToken, req.session.accessTokenSecret, function(error, data, response) {
                                if (error) {
                                    callback(error);
                                } else {
                                    users = users.concat(data.users);
                                    callback();
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null, users);
                            }
                        });
                    }
                ], function(error, users) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, users);
                    }
                });
            }
        ], function(error, data) {
            if(error) {
                res.render('error', {title: title, errors: error});
            } else {
                async.filter(data[1], function(item, callback) {
                    // match against a user object, if found then he is in a list
                    callback(true);
                }, function(lost) {
                    res.render('list', { title: title, friends: lost})
                });
            }
        });
    }
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Listening on ' + port);
});
