var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var SlackWebhook = require('slack-webhook');
var Slack = require('slack-node');
var moment = require('moment');
var _ = require('lodash');
// PROMISE handling.
//var q = require('q');
var Promise = require('bluebird');
// Lib to extract environnement variables from ./.env.
var app_env = require('./app_envparser.js');
// Get environnement variables.
var conf_app = app_env.all();
// Get webhookUri from environnement file (./.env).
const CONF_WEBHOOKURI = conf_app.webhookuri;
const CONF_HOST = conf_app.host;
const CONF_PORT = conf_app.port;
const CONF_TOKEN = conf_app.token;
const CONF_SLACK_TOKEN = conf_app.slacktoken;
const CONF_MAIL_EXTENSION = conf_app.mailextension;
// Local constant.
const AT = '@';

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a new slack Instance.
slackWebhook = new SlackWebhook(CONF_WEBHOOKURI);
slackApi = new Slack(CONF_SLACK_TOKEN);
//slackApi.Promise = q.Promise;
// THIS,
// slack = new SlackWebhook(CONF_WEBHOOKURI, { Promise: bluebird });
// OR,
//slack.Promise = q.Promise;
slackUserCatalog = undefined;

app.post('/webhook', function(req, res) {
    // A promise to handle async slack answer.
    var _promise;
    // Define default challenge and token send by external server.
    var _challenge = req.body.challenge;
    var _token = req.body.token;

    if (_token !==  CONF_TOKEN) {
        console.log('Erreur Token');
        return res.status(404).json({ message: 'Invalid Token' }).end();
    }

    // getUserList().then(function(response) {
        //console.log('Get User List OK');
        if (!_challenge) {
            var _textToSlack;

            var _sender = req.body.sender;
            var _senderName = _sender.lastName;

            var _recipient = req.body.recipient;
            var _recipientName = 'benoit' || _recipient.apiProfile.name.givenName;
            // Get slack user.
            var _userSlack = findSlackUserByMail(_recipientName + AT + CONF_MAIL_EXTENSION);

            var _event = req.body.event;
            var _timestamp = _event.updatedAt;
            var _postLink;

            if (_event.type === 'post_mention') {
                _postLink ="<" +_event.url +"|click to see the post>"
                _textToSlack = "You have been mentionned in this post ::: " + _postLink + " --- At : " + moment(_timestamp).format("hh:mm:ss a");
            } else {
                _postLink ="<" +_event.url +"|click to see the content>"
                _textToSlack = "You have been mentionned in this content ::: " + _postLink + " --- At : " + moment(_timestamp).format("hh:mm:ss a");
            }

            _userSlackIcon = _userSlack ? _userSlack.image_original : ":ghost:";
            // console.log('Here is channel ::: @' + _recipientName.toLowerCase());
            // console.log('Here is text :::' +  _textToSlack);
            // console.log('Here is icon :::' +  _userSlackIcon);

            _promise = slackWebhook.send({
                channel: "@" + _recipientName.toLowerCase(),
                username: _senderName,
                text: _textToSlack,
                icon_emoji: _userSlackIcon,
            });
        } else {
            _promise = slackWebhook.send({
                channel: "#testnotificationhook",
                username: 'nodeServerNotification',
                text: 'Handshake has been succesfull !!',
                icon_emoji: ":ghost:",
            });
        }

        _promise.then(function(response) {
            if (!_challenge) {
                res.status(200).json({ message: response }).end();
            } else {
                res.status(200).json({ challenge: _challenge }).end();
            }
        }).catch(function(error) {
            res.status(404).json({ challenge: _challenge }).end();
        })
    //})
});

var getUserList = function() {
    return new Promise(function(resolve, reject) {
        if (!slackUserCatalog) {
            slackApi.api("users.list", function(err, response) {
                if (!err) {
                    slackUserCatalog = _.map(response.members, 'profile');
                    resolve(slackUserCatalog);
                } else {
                    reject('error');
                }
            });
        } else {
            resolve(slackUserCatalog);
        }
    })
}

var findSlackUserByMail = function(email) {
    return _.filter(slackUserCatalog, { email: email})[0];
}

app.get('/test', function(req, res) {
    res.status(200).json({ response: 'Server is running !!' }).end();
});

app.get('/', function(req, res) {
    res.status(200).json({ response: 'ROOT Server is running !!' }).end();
});

app.post('/finduser', function(req, res) {
    if (!slackUserCatalog) {
        getUserList().then(function(response) {
            res.status(200).json({ user: findSlackUserByMail(req.body.email) }).end();
        });
    } else {
        res.status(200).json({ user: findSlackUserByMail(req.body.email) }).end();
    }

});

app.get('/getuserlist', function(req, res) {
    getUserList().then(function(response) {
        res.status(200).json({ response: response }).end();
    });
});

var server = app.listen(CONF_PORT, CONF_HOST, () => {
    console.log(`:: App running for slack notification hook :: ${server.address().address}:${server.address().port}`);
});
