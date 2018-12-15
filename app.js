// Local files
require('./CommonTools.js')();
let rClient = require('./RedditClient.js');

let express = require('express');
let Faye = require('faye');
let http = require('http');

let RedditClient = new rClient('agree-with-you', 'potato123', start);

let app = express();
let server = http.createServer(app);
let bayeux = new Faye.NodeAdapter({mount: '/', timeout: 45});

let port = process.env.PORT || 8000;

let subredditMostList = GetUniqueArray();
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
	setInterval(function() {if (shudGetAuthAgain) { RedditClient.getAuth()} shudGetAuthAgain = true;}, (1000 * 60 * 60));
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