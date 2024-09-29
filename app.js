import { CreateAuthedClient } from 'reddit-simple-client';

import express from 'express';
import Faye from 'faye';
import http from 'http';
import 'dotenv/config';

// Re-auth every hour
const REAUTHENTICATE_REDDIT = 1000 * 60 * 60;
const MINIMUM_TIME_BETWEEN_REDDIT_COMMENTS = 1000;
const SECS_PROCESSED_A_POOLED_COMMENT = 5;

let renewRedditAuth = false;

// Better to throw an error sooner than later
if (!process.env.REDDIT_LOGIN_USERNAME || !process.env.REDDIT_LOGIN_PASSWORD) {
  throw 'REDDIT_LOGIN_USERNAME && REDDIT_LOGIN_PASSWORD environment variables must be set!';
}

const redditAuth = {
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
  appId: process.env.REDDIT_APP_ID,
  appSecret: process.env.REDDIT_APP_SECRET,
  redirectUrl: 'https://github.com/LionelBergen/reddit-agree-with-you',
  accessToken: null,
  userAgent: 'u/agree-with-you reddit-agree-with-you/2.0.0 by Lionel Bergen'
};

const app = express();
const server = http.createServer(app);
const bayeux = new Faye.NodeAdapter({ mount: '/', timeout: 45 });

const port = process.env.PORT || 8000;

let lastSentAt = new Date().getTime();
const pooledCommentsToReplyTo = [];

const client = new Faye.Client(`http://localhost:${port}/faye`);

bayeux.attach(server);

bayeux.on('handshake', function(clientId) {
  console.log('Client connected', clientId);
});

// Listen for a message containing a comment & reply message to process
server.listen(port, function() {
  console.log('Listening on port: ' + port);
});

function startIntervals(RedditClient) {
  const intervalFunction = () => {
    postFromPooledComments(RedditClient);
  };

  // If too many comments come in at once, add them to a pool to be processed during quiet periods
  setInterval(intervalFunction, SECS_PROCESSED_A_POOLED_COMMENT);

  // Renew auth every hour.
  setInterval(function() {
    if (renewRedditAuth) {
      RedditClient.getAuth();
    }

    renewRedditAuth = true;
  }, REAUTHENTICATE_REDDIT);
}

function subscribeAndStartProcessingComments(RedditClient) {
  client.subscribe('/messages', function(newMessage) {
    if (newMessage.comment) {
      const reply = newMessage.reply;
      newMessage = newMessage.comment;

      if (pooledCommentsToReplyTo.length == 0
        && new Date().getTime() - lastSentAt > MINIMUM_TIME_BETWEEN_REDDIT_COMMENTS) {
        processComment(RedditClient, newMessage, reply);
      } else {
        pooledCommentsToReplyTo.push({ name: newMessage.name, reply: reply });
      }
    } else {
      console.log(newMessage);
    }
  });
}

function postFromPooledComments(RedditClient) {
  if (pooledCommentsToReplyTo.length > 0 && getCurrentTime() - lastSentAt > MINIMUM_TIME_BETWEEN_REDDIT_COMMENTS) {
    const comment = pooledCommentsToReplyTo[0];

    // Process the comment and remove it from our pool
    processComment(RedditClient, comment, comment.reply);
    pooledCommentsToReplyTo.splice(0, 1);
  }
}

/**
 * Posts the reply to a comment and sets 'lastSendAt' variable to the current time
*/
function processComment(RedditClient, comment, reply) {
  RedditClient.postComment(comment.name, reply);
  lastSentAt = getCurrentTime();
}

function getCurrentTime() {
  return new Date().getTime();
}

(async () => {
  const RedditClient = await CreateAuthedClient({ redditAuth });
  startIntervals(RedditClient);
  subscribeAndStartProcessingComments(RedditClient);
})();
