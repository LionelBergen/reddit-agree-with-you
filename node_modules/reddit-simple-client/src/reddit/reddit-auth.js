import RedditApi from 'reddit-oauth';
import log from '../util/log.js';
const DEFAULT_USER_AGENT = 'u/dusty-trash reddit-simple-client/2.0.0 by Lionel Bergen';

export class RedditAuth {
  constructor({ redditAuth }) {
    this.redditAuth = redditAuth;
    this.Reddit;
  }

  getAuth() {
    const self = this;
    this.Reddit = new RedditApi({
      app_id: this.redditAuth.appId,
      app_secret: this.redditAuth.appSecret,
      redirect_uri: this.redditAuth.redirectUrl,
      user_agent: DEFAULT_USER_AGENT
    });

    return new Promise((resolve, reject) => {
      // Authenticate with username/password
      self.Reddit.passAuth(
        this.redditAuth.username,
        this.redditAuth.password,
        function(success) {
          if (success) {
            self.redditAuth.accessToken = self.Reddit.access_token;
            resolve(self.Reddit.access_token);
          } else {
            log.error('something went wrong.');
            reject('Something went wrong when getting access_token.');
          }
        }
      );
    });
  }

  getListing(path, params) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.Reddit.getListing(path, params, (error, response, body) => {
        if(error) {
          log.error(error);
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  postComment(commentId, text) {
    const self = this;
    const path = '/api/comment';
    const params = {
      api_type: 'json',
      thing_id: commentId,
      text
    };

    return new Promise((resolve, reject) => {
      self.Reddit.post(path, params, (error, response, body) => {
        log.debug(response);
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }
}

export async function CreateAuth({ redditAuth }) {
  const newRedditAuth = new RedditAuth({ redditAuth });
  await newRedditAuth.getAuth();

  return newRedditAuth;
}
