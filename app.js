// Local files
require('./CommonTools.js')();
const rClient = require('./RedditClient.js');

const express = require('express');
const Faye = require('faye');
const http = require('http');

// Re-auth every hour
const RE_AUTHENTICATE_REDDIT = 1000 * 60 * 60;

if (!process.env.REDDIT_LOGIN_USERNAME || !process.env.REDDIT_LOGIN_PASSWORD) {
  throw 'REDDIT_LOGIN_USERNAME && REDDIT_LOGIN_PASSWORD environment variables must be set!';
}

const RedditClient = new rClient(process.env.REDDIT_LOGIN_USERNAME, process.env.REDDIT_LOGIN_PASSWORD, start);

const app = express();
const server = http.createServer(app);
const bayeux = new Faye.NodeAdapter({mount: '/', timeout: 45});

const port = process.env.PORT || 8000;

var lastSentAt = new Date().getTime();
var pooledCommentsToReplyTo = [];

bayeux.attach(server);

bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/test.html');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500);
});

server.listen(port, function() {
    console.log('Listening on ' + port);
});

var shudGetAuthAgain = false;

function start()
{
	setInterval(postFromPooledComments, 5);
	// Renew auth every hour. 
	setInterval(function() {
    if (shudGetAuthAgain) 
    {
      RedditClient.getAuth()
    } 
    
    shudGetAuthAgain = true;
  }, RE_AUTHENTICATE_REDDIT);
	subscribeAndStartPostingComments();
}

function subscribeAndStartPostingComments()
{
	client.subscribe('/messages', function (newMessage) {
		if (newMessage.comment)
		{
			reply = newMessage.reply;
			newMessage = newMessage.comment;
			
			if (pooledCommentsToReplyTo.length == 0 && new Date().getTime() - lastSentAt > 1000)
			{
				processComment(newMessage, reply);
			}
			else
			{
				pooledCommentsToReplyTo.push({name: newMessage.name, reply: reply});
			}
		}
		else
		{
			console.log(newMessage);
		}
	});
}

function postFromPooledComments()
{
	if (pooledCommentsToReplyTo.length > 0 && new Date().getTime() - lastSentAt > 1000)
	{
		var comment = pooledCommentsToReplyTo[0];
		
		processComment(comment, comment.reply);
		pooledCommentsToReplyTo.splice(0, 1);
	}
}

var client = new Faye.Client('http://localhost: ' + port + '/faye');

function processComment(comment, reply)
{
	RedditClient.postComment(comment.name, reply);
	lastSentAt = new Date().getTime();
}