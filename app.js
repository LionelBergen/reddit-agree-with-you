// Local files
const rClient = require('./RedditClient.js');

const express = require('express');
const Faye = require('faye');
const http = require('http');

// Re-auth every hour
const REAUTHENTICATE_REDDIT = 1000 * 60 * 60;
const MINIMUM_TIME_BETWEEN_REDDIT_COMMENTS = 1000;

let renewRedditAuth = false;

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

const client = new Faye.Client('http://localhost: ' + port + '/faye');

bayeux.attach(server);

bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
});

// Listen for a message containing a comment & reply message to process
server.listen(port, function() {
    console.log('Listening on port: ' + port);
});

function start()
{
	setInterval(postFromPooledComments, 5);
  
	// Renew auth every hour. 
	setInterval(function() {
    if (renewRedditAuth) 
    {
      RedditClient.getAuth()
    } 
    
    renewRedditAuth = true;
  }, REAUTHENTICATE_REDDIT);
  
	subscribeAndStartPostingComments();
}

function subscribeAndStartPostingComments()
{
	client.subscribe('/messages', function (newMessage) {
		if (newMessage.comment)
		{
			reply = newMessage.reply;
			newMessage = newMessage.comment;
			
			if (pooledCommentsToReplyTo.length == 0 && new Date().getTime() - lastSentAt > MINIMUM_TIME_BETWEEN_REDDIT_COMMENTS)
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
	if (pooledCommentsToReplyTo.length > 0 && getCurrentTime() - lastSentAt > MINIMUM_TIME_BETWEEN_REDDIT_COMMENTS)
	{
		let comment = pooledCommentsToReplyTo[0];
		
    // Process the comment and remove it from our pool
		processComment(comment, comment.reply);
		pooledCommentsToReplyTo.splice(0, 1);
	}
}

/**
 * Posts the reply to a comment and sets 'lastSendAt' variable to the current time
*/
function processComment(comment, reply)
{
	RedditClient.postComment(comment.name, reply);
	lastSentAt = getCurrentTime();
}

function getCurrentTime()
{
  return new Date().getTime();
}