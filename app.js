// Local files
const rClient = require('./RedditClient.js');

const express = require('express');
const Faye = require('faye');
const http = require('http');

// Re-auth every hour
const RE_AUTHENTICATE_REDDIT = 1000 * 60 * 60;

// Better to throw an error sooner than later
if (!process.env.REDDIT_LOGIN_USERNAME || !process.env.REDDIT_LOGIN_PASSWORD) {
  throw 'REDDIT_LOGIN_USERNAME && REDDIT_LOGIN_PASSWORD environment variables must be set!';
}

// Note the last argument is the start function
const RedditClient = new rClient(process.env.REDDIT_LOGIN_USERNAME, process.env.REDDIT_LOGIN_PASSWORD, start);

const app = express();
const server = http.createServer(app);
const bayeux = new Faye.NodeAdapter({mount: '/', timeout: 45});

const port = process.env.PORT || 8000;

let lastSentAt = new Date().getTime();
let pooledCommentsToReplyTo = [];

bayeux.attach(server);

bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
});

server.listen(port, function() {
    console.log('Listening on port: ' + port);
});

let shudGetAuthAgain = false;

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
		let comment = pooledCommentsToReplyTo[0];
		
		processComment(comment, comment.reply);
		pooledCommentsToReplyTo.splice(0, 1);
	}
}

let client = new Faye.Client('http://localhost: ' + port + '/faye');

function processComment(comment, reply)
{
	RedditClient.postComment(comment.name, reply);
	lastSentAt = new Date().getTime();
}