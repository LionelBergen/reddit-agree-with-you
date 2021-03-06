const RedditApi = require('reddit-oauth');

if (!process.env.REDDIT_APP_ID || !process.env.REDDIT_APP_SECRET) {
  throw 'REDDIT_APP_ID && REDDIT_APP_SECRET environment variables must be set!';
}

const reddit = new RedditApi({
    app_id: process.env.REDDIT_APP_ID,
    app_secret: process.env.REDDIT_APP_SECRET,
    redirect_uri: 'https://www.reddit.com/user/dusty-trash'
});

class RedditClient
{
	constructor(redditAccountUsername, redditAccountPassword, callback)
	{
		this.accountUsername = redditAccountUsername;
		this.accountPassword = redditAccountPassword;
		this.accessToken = null;
		this.getAuth(callback);
	}
	
	getAuth(callback)
	{
		let self = this;
		reddit.passAuth(
			self.accountUsername,
			self.accountPassword,
			function (success) {
				if (success) {
					reddit.oAuthUrl('some_state', 'identity');
					// Print the access token we just retrieved
					console.log('got access token: ' + reddit.access_token);
					self.accessToken = reddit.access_token;
          
					callback();
				}
				else
				{
					console.log('error retrieving Reddit Access Token!');
				}
			},
			function (error) {
				console.log('error on Reddit auth:');
				console.log(error);
			}
		);
	}
	
	postComment(commentId, textToComment)
	{
		console.log('trying to post comment : ' + textToComment + ' with id: ' + commentId);
		reddit.post(
			'/api/comment',
			{
				api_type: 'json',
				thing_id: commentId,
				text: textToComment
			},
			function (error, response, body) {
				console.log('error: ' + error);
				console.log('error body: ' + body);
			}
		);
	}
}

module.exports = RedditClient;