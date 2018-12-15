let https = require('https');
let RedditApi = require('reddit-oauth');
let querystring = require('querystring');

let reddit = new RedditApi({
    app_id: 'ns4qBGl3H_JMhg',
    app_secret: '9_V0XEx2OEEelIdzZ4RhmhYurtw',
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
		var self = this;
		reddit.passAuth(
			self.accountUsername,
			self.accountPassword,
			function (success) {
				if (success) {
					reddit.oAuthUrl('some_state', 'identity');
					console.log('got access token: ' + reddit.access_token);
					// Print the access token we just retrieved
					self.accessToken = reddit.access_token;
					
					callback();
				}
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
	
	getSubredditModList(subreddit, callback)
	{
		var url = 'https://www.reddit.com/r/' + subreddit + '/about/moderators.json?';
		console.log('trying get mod list from url : ' + subreddit + ' url: ' + url);
		https.get(url, (res) => {
			var message = '';
			res.on('data', (d) => {
				message += d;
			});
			
			res.on('end',function(){
				if (res.statusCode != 200) 
				{
					callback("Api call failed with response code " + res.statusCode);
				} 
				else 
				{
					var messages = JSON.parse(message).data.children;
					var modNamesCommaDelimitedList = messages.map(function(m) { return m.name; });
					callback(modNamesCommaDelimitedList);
				}
			});
		}).on('error', (e) => {
			console.log('error getting subreddit: ' + subreddit);
			console.error(e);
		});
	}
}

module.exports = RedditClient;